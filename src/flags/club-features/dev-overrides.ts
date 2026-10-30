import { CLUB_FEATURE_FLAGS, type ClubFeatures } from './definitions';

/**
 * 로컬 개발 서버에서만 Flagsmith 값을 덮어쓰는 쿠키.
 * 값은 `encodeURIComponent(JSON.stringify({ feedbackFabEnabled: true }))` 형태다.
 * 디자인 검증 E2E(`e2e/design`)가 A/B 화면을 서버 재시작 없이 오가려고 사용한다.
 */
export const DEV_FLAG_OVERRIDE_COOKIE = 'weeth_dev_flag_overrides';

export function isDevFlagOverrideEnabled() {
  return process.env.NODE_ENV === 'development';
}

/** 등록된 플래그 키의 boolean 값만 남기고, 형식이 잘못된 값은 조용히 버린다. */
export function parseDevFlagOverrides(raw: string | undefined): Partial<ClubFeatures> {
  if (!raw) return {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(decodeURIComponent(raw));
  } catch {
    return {};
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};

  return Object.fromEntries(
    Object.entries(parsed).filter(
      ([key, value]) => Object.hasOwn(CLUB_FEATURE_FLAGS, key) && typeof value === 'boolean',
    ),
  ) as Partial<ClubFeatures>;
}
