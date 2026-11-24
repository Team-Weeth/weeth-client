export const CLUB_FEATURE_FLAGS = {
  warningEnabled: 'club_warning_enabled',
  // 서비스 피드백 A/B: ON이면 FAB(A안), OFF면 마이페이지 설정 항목(B안)을 노출한다.
  // 유저 단위 % Split으로 배정하므로 user:{userId} identity로 조회한다.
  feedbackFabEnabled: 'feedback_fab_enabled',
  // 왁뿌볼 이벤트 진입점(상단 띠배너·GNB 이벤트 탭·홈 팝업). 게임 운영 스위치와 같은 플래그라
  // 게임을 닫으면 진입점도 함께 사라진다. 게임 화면(`isWaxEnabled`)과 달리 조회에 실패하면 숨긴다.
  waxEventEnabled: 'wax_enabled',
  // 어드민 일정 관리 개편(WTH-11). ON이면 캘린더형 일정 관리 화면, OFF면 기존 목록형 화면을 노출한다.
  adminScheduleV2Enabled: 'club_admin_schedule_v2_enabled',
} as const;

/** user:{userId} identity로 조회하는 플래그. 나머지는 club:{clubId} identity로 조회한다. */
export const USER_SCOPED_FLAGS = ['feedbackFabEnabled'] as const satisfies ReadonlyArray<
  keyof typeof CLUB_FEATURE_FLAGS
>;

export type ClubFeatures = { [K in keyof typeof CLUB_FEATURE_FLAGS]: boolean };

export const DEFAULT_CLUB_FEATURES: ClubFeatures = {
  warningEnabled: false,
  feedbackFabEnabled: false,
  waxEventEnabled: false,
  adminScheduleV2Enabled: false,
};
