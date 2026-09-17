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

async function getFeatureFlags(
  featureNames: readonly string[],
  options: FeatureFlagOptions = {},
): Promise<Record<string, boolean>> {
  const environmentID = getFlagsmithEnvironmentId();
  const defaults = Object.fromEntries(featureNames.map((name) => [name, false]));
  if (!environmentID) return defaults;

  // 서버의 동시 요청 간에 동아리 identity와 플래그 상태가 섞이지 않도록 분리한다.
  const flagsmith = createFlagsmithInstance();

  try {
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

    return Object.fromEntries(featureNames.map((name) => [name, flagsmith.hasFeature(name)]));
  } catch {
    return defaults;
  }
}

async function isFeatureEnabled(
  featureName: string,
  options: FeatureFlagOptions = {},
): Promise<boolean> {
  const flags = await getFeatureFlags([featureName], options);
  return flags[featureName] === true;
}

export { getFeatureFlags, isFeatureEnabled };
