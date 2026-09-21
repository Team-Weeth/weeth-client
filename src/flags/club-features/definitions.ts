export const CLUB_FEATURE_FLAGS = {
  warningEnabled: 'club_warning_enabled',
} as const;

export type ClubFeatures = { [K in keyof typeof CLUB_FEATURE_FLAGS]: boolean };

export const DEFAULT_CLUB_FEATURES: ClubFeatures = {
  warningEnabled: false,
};
