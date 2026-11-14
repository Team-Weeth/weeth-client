import { createFlagsmithInstance } from '@flagsmith/flagsmith/isomorphic';

type FeatureFlagOptions = {
  identifier?: string;
  traits?: Record<string, string | number | boolean>;
};

const getFlagsmithEnvironmentId = () => process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID ?? '';

const fetchFlagsmith: typeof fetch = (input, init) =>
  fetch(input, {
    ...init,
    cache: 'no-store',
    signal: AbortSignal.timeout(5000),
  });

/** 요청마다 새 인스턴스로 플래그를 받아온다. 실패하면 예외를 그대로 던진다. */
async function initFlagsmith(environmentID: string, options: FeatureFlagOptions) {
  // 서버의 동시 요청 간에 동아리 identity와 플래그 상태가 섞이지 않도록 분리한다.
  const flagsmith = createFlagsmithInstance();
  await flagsmith.init({
    environmentID,
    ...(options.identifier && {
      identity: options.identifier,
      traits: options.traits,
    }),
    fetch: fetchFlagsmith,
    cacheFlags: false,
    enableAnalytics: false,
  });
  return flagsmith;
}

/**
 * fallback은 환경 ID가 없거나 조회에 실패했을 때의 값이다. 기능 노출 플래그는 false(닫힘),
 * 운영 중단 스위치처럼 Flagsmith 장애로 서비스가 꺼지면 안 되는 플래그는 true를 쓴다.
 */
async function getFeatureFlags(
  featureNames: readonly string[],
  options: FeatureFlagOptions = {},
  fallback = false,
): Promise<Record<string, boolean>> {
  const environmentID = getFlagsmithEnvironmentId();
  const defaults = Object.fromEntries(featureNames.map((name) => [name, fallback]));
  if (!environmentID) return defaults;

  try {
    const flagsmith = await initFlagsmith(environmentID, options);
    return Object.fromEntries(featureNames.map((name) => [name, flagsmith.hasFeature(name)]));
  } catch {
    return defaults;
  }
}

/**
 * 환경에 등록된 플래그 전체와 값을 받아온다. 개발용 플래그 패널의 목록 조회에만 쓴다.
 * 화면 동작을 정하는 조회가 아니므로 실패를 기본값으로 숨기지 않고 예외로 알린다.
 */
async function getAllFeatureFlags(
  options: FeatureFlagOptions = {},
): Promise<Record<string, boolean>> {
  const environmentID = getFlagsmithEnvironmentId();
  if (!environmentID)
    throw new Error('NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID가 설정되지 않았습니다.');

  const flagsmith = await initFlagsmith(environmentID, options);
  return Object.fromEntries(
    Object.entries(flagsmith.getAllFlags()).map(([name, flag]) => [name, flag.enabled]),
  );
}

async function isFeatureEnabled(
  featureName: string,
  options: FeatureFlagOptions = {},
): Promise<boolean> {
  const flags = await getFeatureFlags([featureName], options);
  return flags[featureName] === true;
}

export { getAllFeatureFlags, getFeatureFlags, isFeatureEnabled };
