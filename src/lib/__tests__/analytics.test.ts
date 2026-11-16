import posthog from 'posthog-js';
import { trackEvent } from '@/lib/analytics';

jest.mock('posthog-js', () => ({
  __loaded: false,
  capture: jest.fn(),
}));

describe('trackEvent', () => {
  it('posthog가 로드되지 않았으면 capture를 호출하지 않는다', () => {
    trackEvent('tour_started', { tour_id: 'admin-warning' });
    expect(posthog.capture).not.toHaveBeenCalled();
  });

  it('posthog가 로드되면 capture를 호출한다', () => {
    (posthog as unknown as { __loaded: boolean }).__loaded = true;

    trackEvent('tour_started', { tour_id: 'admin-warning' });

    expect(posthog.capture).toHaveBeenCalledWith('tour_started', { tour_id: 'admin-warning' });
  });
});
