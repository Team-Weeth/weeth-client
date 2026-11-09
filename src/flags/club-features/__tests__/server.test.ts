/** @jest-environment node */

import { CLUB_FEATURE_FLAGS, DEFAULT_CLUB_FEATURES } from '@/flags/club-features/definitions';
import { getClubFeatures } from '@/flags/club-features/server';
import { getFeatureFlags } from '@/lib/flagsmith';

jest.mock('server-only', () => ({}));
jest.mock('@/lib/flagsmith', () => ({ getFeatureFlags: jest.fn() }));

const mockGetFeatureFlags = jest.mocked(getFeatureFlags);

describe('club feature definitions', () => {
  it('서비스 피드백 FAB 플래그를 등록하고 기본값은 OFF(B안)로 둔다', () => {
    expect(CLUB_FEATURE_FLAGS.feedbackFabEnabled).toBe('club_feedback_fab_enabled');
    expect(DEFAULT_CLUB_FEATURES.feedbackFabEnabled).toBe(false);
  });

  it('모든 등록 플래그에 기본값이 있다', () => {
    expect(Object.keys(DEFAULT_CLUB_FEATURES).sort()).toEqual(
      Object.keys(CLUB_FEATURE_FLAGS).sort(),
    );
  });
});

describe('getClubFeatures', () => {
  it('동아리 identity로 등록된 모든 플래그를 조회하고 값이 true일 때만 켠다', async () => {
    mockGetFeatureFlags.mockResolvedValueOnce({
      club_warning_enabled: false,
      club_feedback_fab_enabled: true,
    });

    await expect(getClubFeatures('club-a')).resolves.toEqual({
      warningEnabled: false,
      feedbackFabEnabled: true,
    });
    expect(mockGetFeatureFlags).toHaveBeenCalledWith(
      expect.arrayContaining(['club_warning_enabled', 'club_feedback_fab_enabled']),
      { identifier: 'club:club-a', traits: { club_id: 'club-a' } },
    );
  });

  it('조회 결과에 없는 플래그는 OFF로 처리한다', async () => {
    mockGetFeatureFlags.mockResolvedValueOnce({});

    await expect(getClubFeatures('club-b')).resolves.toEqual(DEFAULT_CLUB_FEATURES);
  });
});
