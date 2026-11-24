/** @jest-environment node */

import { CLUB_FEATURE_FLAGS, DEFAULT_CLUB_FEATURES } from '@/flags/club-features/definitions';
import { getClubFeatures } from '@/flags/club-features/server';
import { getFeatureFlags } from '@/lib/flagsmith';

jest.mock('server-only', () => ({}));
jest.mock('@/lib/flagsmith', () => ({ getFeatureFlags: jest.fn() }));

const mockGetFeatureFlags = jest.mocked(getFeatureFlags);

describe('club feature definitions', () => {
  it('서비스 피드백 FAB 플래그를 유저 단위 키로 등록하고 기본값은 OFF(B안)로 둔다', () => {
    expect(CLUB_FEATURE_FLAGS.feedbackFabEnabled).toBe('feedback_fab_enabled');
    expect(DEFAULT_CLUB_FEATURES.feedbackFabEnabled).toBe(false);
  });

  it('어드민 일정 관리 개편 플래그를 등록하고 기본값은 OFF(개편 전 화면)로 둔다', () => {
    expect(CLUB_FEATURE_FLAGS.adminScheduleV2Enabled).toBe('club_admin_schedule_v2_enabled');
    expect(DEFAULT_CLUB_FEATURES.adminScheduleV2Enabled).toBe(false);
  });

  it('모든 등록 플래그에 기본값이 있다', () => {
    expect(Object.keys(DEFAULT_CLUB_FEATURES).sort()).toEqual(
      Object.keys(CLUB_FEATURE_FLAGS).sort(),
    );
  });
});

describe('getClubFeatures', () => {
  it('동아리 플래그는 club identity, 유저 플래그는 user identity로 분리 조회한다', async () => {
    // 동아리 identity 조회 결과
    mockGetFeatureFlags.mockResolvedValueOnce({
      club_warning_enabled: false,
      wax_enabled: true,
      club_admin_schedule_v2_enabled: true,
    });
    // 유저 identity 조회 결과
    mockGetFeatureFlags.mockResolvedValueOnce({
      feedback_fab_enabled: true,
    });

    await expect(getClubFeatures('club-a', 'user-1')).resolves.toEqual({
      warningEnabled: false,
      feedbackFabEnabled: true,
      waxEventEnabled: true,
      adminScheduleV2Enabled: true,
    });
    expect(mockGetFeatureFlags).toHaveBeenCalledWith(
      expect.arrayContaining(['club_warning_enabled', 'wax_enabled']),
      { identifier: 'club:club-a', traits: { club_id: 'club-a' } },
    );
    expect(mockGetFeatureFlags).toHaveBeenCalledWith(
      expect.arrayContaining(['feedback_fab_enabled']),
      { identifier: 'user:user-1' },
    );
  });

  it('userId 없이 호출하면 유저 플래그는 OFF로 처리한다', async () => {
    mockGetFeatureFlags.mockResolvedValueOnce({
      club_warning_enabled: true,
      wax_enabled: false,
      club_admin_schedule_v2_enabled: false,
    });

    await expect(getClubFeatures('club-b')).resolves.toEqual({
      warningEnabled: true,
      feedbackFabEnabled: false,
      waxEventEnabled: false,
      adminScheduleV2Enabled: false,
    });
    // 유저 플래그 조회는 호출하지 않는다
    expect(mockGetFeatureFlags).toHaveBeenCalledTimes(1);
  });

  it('조회 결과에 없는 플래그는 OFF로 처리한다', async () => {
    mockGetFeatureFlags.mockResolvedValueOnce({});
    mockGetFeatureFlags.mockResolvedValueOnce({});

    await expect(getClubFeatures('club-c', 'user-2')).resolves.toEqual(DEFAULT_CLUB_FEATURES);
  });
});
