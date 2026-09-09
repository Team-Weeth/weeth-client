/** @jest-environment node */

import { isFeatureEnabled } from '../flagsmith';

describe('Flagsmith club targeting', () => {
  const originalFetch = global.fetch;
  const originalEnvironment = process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID;
  const fetchMock = jest.fn();

  beforeEach(() => {
    process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID = 'test-environment';
    global.fetch = fetchMock;
    fetchMock.mockReset();
  });

  afterAll(() => {
    global.fetch = originalFetch;
    if (originalEnvironment === undefined) {
      delete process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID;
    } else {
      process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID = originalEnvironment;
    }
  });

  it('evaluates each club with its own identity and club_id trait', async () => {
    fetchMock.mockImplementation(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(init.body as string);
      expect(body.identifier).toBe(`club:${body.traits[0].trait_value}`);
      expect(body.traits[0].trait_key).toBe('club_id');
      return {
        ok: true,
        json: async () => ({
          flags: [
            {
              feature: { name: 'club_warning_enabled' },
              enabled: body.traits[0].trait_value === 'allowed',
            },
          ],
        }),
      };
    });

    for (const clubId of ['allowed', 'other']) {
      await expect(
        isFeatureEnabled('club_warning_enabled', {
          identifier: `club:${clubId}`,
          traits: { club_id: clubId },
        }),
      ).resolves.toBe(clubId === 'allowed');
    }
  });

  it('disables warnings on network or invalid JSON failures', async () => {
    fetchMock.mockRejectedValueOnce(new Error('offline'));
    await expect(isFeatureEnabled('club_warning_enabled')).resolves.toBe(false);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error('invalid JSON');
      },
    });
    await expect(isFeatureEnabled('club_warning_enabled')).resolves.toBe(false);
  });
});
