const FLAGSMITH_API_URL = 'https://edge.api.flagsmith.com/api/v1/flags/';
const FLAGSMITH_IDENTITIES_API_URL = 'https://edge.api.flagsmith.com/api/v1/identities/';

type FlagsmithFeatureState = {
  enabled?: boolean;
  feature?: {
    name?: string;
  };
};

type FlagsmithIdentityResponse = {
  flags?: FlagsmithFeatureState[];
};

type FeatureFlagOptions = {
  identifier?: string;
  traits?: Record<string, string | number | boolean>;
};

const getFlagsmithEnvironmentId = () =>
  process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID ??
  process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_KEY ??
  '';

async function fetchFlagsmithJson(url: string, init: RequestInit = {}): Promise<unknown> {
  const environmentId = getFlagsmithEnvironmentId();

  if (!environmentId) {
    return null;
  }

  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        'X-Environment-Key': environmentId,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

async function getFlagsmithFeatureStates(
  options: FeatureFlagOptions = {},
): Promise<FlagsmithFeatureState[]> {
  if (options.identifier) {
    const params = new URLSearchParams({ identifier: options.identifier });
    const data = options.traits
      ? await fetchFlagsmithJson(FLAGSMITH_IDENTITIES_API_URL, {
          method: 'POST',
          body: JSON.stringify({
            identifier: options.identifier,
            traits: Object.entries(options.traits).map(([trait_key, trait_value]) => ({
              trait_key,
              trait_value,
            })),
          }),
        })
      : await fetchFlagsmithJson(`${FLAGSMITH_IDENTITIES_API_URL}?${params.toString()}`);
    const identity = data as FlagsmithIdentityResponse | null;

    return Array.isArray(identity?.flags) ? identity.flags : [];
  }

  const data = await fetchFlagsmithJson(FLAGSMITH_API_URL);

  return Array.isArray(data) ? data : [];
}

async function isFeatureEnabled(
  featureName: string,
  options: FeatureFlagOptions = {},
): Promise<boolean> {
  const featureStates = await getFlagsmithFeatureStates(options);
  const featureState = featureStates.find((state) => state.feature?.name === featureName);

  return featureState?.enabled === true;
}

export { isFeatureEnabled };
