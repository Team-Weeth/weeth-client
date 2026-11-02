export const CLUB_FEATURE_FLAGS = {
  warningEnabled: 'club_warning_enabled',
  // 서비스 피드백 A/B: ON이면 FAB(A안), OFF면 마이페이지 설정 항목(B안)을 노출한다.
  feedbackFabEnabled: 'club_feedback_fab_enabled',
} as const;

export type ClubFeatures = { [K in keyof typeof CLUB_FEATURE_FLAGS]: boolean };

export const DEFAULT_CLUB_FEATURES: ClubFeatures = {
  warningEnabled: false,
  feedbackFabEnabled: false,
};
