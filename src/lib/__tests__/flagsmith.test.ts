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
      expect(init.cache).toBe('no-store');
      expect(init.signal).toBeInstanceOf(AbortSignal);
      return Response.json({
        flags: [
          {
            feature: { name: 'club_warning_enabled' },
            enabled: body.traits[0].trait_value === 'allowed',
          },
        ],
      });
    });

    await Promise.all(
      ['allowed', 'other'].map(async (clubId) => {
        await expect(
          isFeatureEnabled('club_warning_enabled', {
            identifier: `club:${clubId}`,
            traits: { club_id: clubId },
          }),
        ).resolves.toBe(clubId === 'allowed');
      }),
    );
  });

  it('disables warnings on network or invalid JSON failures', async () => {
    fetchMock.mockRejectedValueOnce(new Error('offline'));
    await expect(isFeatureEnabled('club_warning_enabled')).resolves.toBe(false);
    fetchMock.mockResolvedValueOnce(new Response('invalid JSON', { status: 200 }));
    await expect(isFeatureEnabled('club_warning_enabled')).resolves.toBe(false);
  });

  it('uses environment flags without an identity and disables unknown flags', async () => {
    fetchMock.mockResolvedValue(
      Response.json([{ feature: { name: 'club_warning_enabled' }, enabled: true }]),
    );
    await expect(isFeatureEnabled('club_warning_enabled')).resolves.toBe(true);
    await expect(isFeatureEnabled('unknown')).resolves.toBe(false);
    expect(fetchMock.mock.calls[0][0]).toContain('/flags/');
  });

  it('returns false without requesting flags when the environment is missing', async () => {
    delete process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID;
    await expect(isFeatureEnabled('club_warning_enabled')).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns false on HTTP failures', async () => {
    fetchMock.mockResolvedValueOnce(new Response('Unavailable', { status: 503 }));
    await expect(isFeatureEnabled('club_warning_enabled')).resolves.toBe(false);
  });
});
