import { CLUB_FEATURE_FLAGS, type ClubFeatures } from './definitions';

/**
 * 로컬 개발 서버와 dev 배포에서만 Flagsmith 값을 덮어쓰는 쿠키.
 * 값은 플래그 이름(Flagsmith의 feature name) 기준 `encodeURIComponent(JSON.stringify({ club_warning_enabled: true }))` 형태다.
 * 개발용 플래그 패널(`DevFlagPanel`)과 디자인 검증 E2E(`e2e/design`)가 사용한다.
 */
export const DEV_FLAG_OVERRIDE_COOKIE = 'weeth_dev_flag_overrides';

/** 플래그 이름 형식. 쿠키에 임의 문자열이 쌓이지 않도록 제한한다. */
export const DEV_FLAG_KEY_PATTERN = /^[A-Za-z0-9_.-]{1,64}$/;
// 쿠키 한 개 크기(4KB) 안에 들어가도록 개수를 제한한다.
export const MAX_DEV_FLAG_OVERRIDES = 30;

export type DevFlagOverrides = Record<string, boolean>;

export function isDevFlagOverrideEnabled() {
  // 운영 배포는 다른 설정과 관계없이 막는다.
  if (process.env.NEXT_PUBLIC_APP_ENV === 'production') return false;
  if (process.env.NODE_ENV === 'development') return true;
  // dev 배포도 프로덕션 빌드라 NODE_ENV로 운영과 구분할 수 없어, 명시적으로 켠 환경에서만 허용한다.
  return process.env.ENABLE_DEV_FLAG_OVERRIDES === 'true';
}

/** 형식에 맞는 키의 boolean 값만 남기고, 잘못된 값은 조용히 버린다. */
export function parseDevFlagOverrides(raw: string | undefined): DevFlagOverrides {
  if (!raw) return {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(decodeURIComponent(raw));
  } catch {
    return {};
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};

  return Object.fromEntries(
    Object.entries(parsed)
      .filter(([key, value]) => DEV_FLAG_KEY_PATTERN.test(key) && typeof value === 'boolean')
      .slice(0, MAX_DEV_FLAG_OVERRIDES),
  );
}

export function serializeDevFlagOverrides(overrides: DevFlagOverrides) {
  return encodeURIComponent(JSON.stringify(overrides));
}

/** `ClubFeatures` 속성명으로 쓴 값을 플래그 이름 기준으로 바꾼다. 디자인 검증 스펙용. */
export function toDevFlagOverrides(features: Partial<ClubFeatures>): DevFlagOverrides {
  return Object.fromEntries(
    Object.entries(features).map(([key, value]) => [
      CLUB_FEATURE_FLAGS[key as keyof ClubFeatures],
      value,
    ]),
  );
}
