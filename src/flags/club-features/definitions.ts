export const CLUB_FEATURE_FLAGS = {
  warningEnabled: 'club_warning_enabled',
  // 서비스 피드백 A/B: ON이면 FAB(A안), OFF면 마이페이지 설정 항목(B안)을 노출한다.
  feedbackFabEnabled: 'club_feedback_fab_enabled',
  // 왁뿌볼 이벤트 진입점(상단 띠배너·GNB 이벤트 탭·홈 팝업). 게임 운영 스위치와 같은 플래그라
  // 게임을 닫으면 진입점도 함께 사라진다. 게임 화면(`isWaxEnabled`)과 달리 조회에 실패하면 숨긴다.
  waxEventEnabled: 'wax_enabled',
} as const;

export type ClubFeatures = { [K in keyof typeof CLUB_FEATURE_FLAGS]: boolean };

export const DEFAULT_CLUB_FEATURES: ClubFeatures = {
  warningEnabled: false,
  feedbackFabEnabled: false,
  waxEventEnabled: false,
};
