# Feature Flag Rules

Use the existing club feature flag architecture when implementing club-specific functionality or version switching. Keep feature UI and business logic in their existing feature folders; use flags to decide which functionality or version to expose.

## Files

- `src/flags/club-features/definitions.ts`: Flagsmith keys, the derived `ClubFeatures` type, and default values.
- `src/flags/club-features/server.ts`: Server-only `getClubFeatures(clubId)`. Fetches the registered flags together using the `club:<clubId>` identity and the `club_id` trait. React `cache` deduplicates calls with the same club ID within a server render request; it is not a persistent cache across requests.
- `src/providers/club-feature-provider.tsx`: `ClubFeatureProvider` shares the server result through React Context. `useClubFeatures()` reads that result without making network requests.
- `src/lib/flagsmith.ts`: Flagsmith SDK initialization, batched flag lookup, and failure handling. `getAllFeatureFlags` lists every flag for the dev panel and throws on failure instead of returning defaults.

## Implementation Rules

- Keep Flagsmith SDK access in `src/lib/flagsmith.ts` and club-specific resolution in the server module.
- Read shared values with `useClubFeatures()` instead of forwarding flag props through intermediate components.
- Keep feature implementations in their domain folders; do not move UI code into `src/flags/club-features`.

## Usage

Fetch flags in a server page and wrap the client UI with the provider:

```tsx
import { getClubFeatures } from '@/flags/club-features/server';
import { ClubFeatureProvider } from '@/providers/club-feature-provider';

const features = await getClubFeatures(clubId);

return (
  <ClubFeatureProvider key={clubId} features={features}>
    <MemberPageContent />
  </ClubFeatureProvider>
);
```

The club key resets child state when switching clubs. The current member and penalty pages also include `features.warningEnabled` in the key to reset editing state when that value changes.

Read flags only in components that need to branch:

```tsx
'use client';

import { useClubFeatures } from '@/providers/club-feature-provider';

function WarningAction() {
  const { warningEnabled } = useClubFeatures();
  return warningEnabled ? <button>Issue warning</button> : null;
}
```

Intermediate components do not need flag props. React portals, including modals, inherit the context when rendered within the provider's React tree. Wrap new pages with the provider as well; it is not currently installed globally.

## Adding a Feature

1. Create a flag in Flagsmith and configure segment overrides for the target clubs in the appropriate environment. Keep its default disabled when only selected clubs should receive it.
2. Add its key to `CLUB_FEATURE_FLAGS` in `src/flags/club-features/definitions.ts`. `ClubFeatures` automatically derives its property names from this object.
3. Add a default value to `DEFAULT_CLUB_FEATURES`.
4. Read the new property through `useClubFeatures()` where needed. No server or provider changes are required: `getClubFeatures` maps every registered key to a boolean automatically, enabling it only when the fetched value is exactly `true`.

For example, add `equipmentEnabled: 'club_equipment_enabled'` to the key map and `equipmentEnabled: false` to the defaults in `definitions.ts`.

Club targeting belongs in Flagsmith segments, not hardcoded club ID lists. For an entirely new management page, gate both its navigation entry and direct route access. Backend authorization must independently enforce access to its APIs.

## Existing and New Versions

For small differences, branch inside the existing component. When structure or behavior differs substantially, keep separate versions in the feature folder and choose between them at a shared entry point:

```tsx
function MemberManagement() {
  const { memberManagementV2Enabled } = useClubFeatures();

  return memberManagementV2Enabled ? <MemberManagementV2 /> : <MemberManagementV1 />;
}
```

This example assumes `memberManagementV2Enabled` has been registered using the steps above. Share common UI and logic between versions instead of duplicating the entire feature. Keep both versions while clubs need different behavior; remove the old implementation and flag after a temporary rollout completes.

Boolean version switching is supported by this structure. Statistical A/B testing additionally requires experiment assignment and exposure/outcome measurement; those are not implemented here.

## Defaults and Refresh Behavior

- Failed lookups, a missing environment key, and unknown flags resolve to `false` in the current SDK wrapper.
- Components outside a provider use `DEFAULT_CLUB_FEATURES`, currently all `false`. This fallback does not replace wiring the provider for a new page.
- Values are a snapshot from the server render. The client does not poll or subscribe to Flagsmith changes. Updated settings take effect when a fresh server lookup runs, for example after refreshing the page.
- Feature flags control UI availability and do not replace backend permission checks.

## Overrides for Development

The `weeth_dev_flag_overrides` cookie overrides Flagsmith values in two environments: the local dev server (`NODE_ENV=development`) and deployments that set the server env `ENABLE_DEV_FLAG_OVERRIDES=true` (the dev Amplify app). `NEXT_PUBLIC_APP_ENV=production` always disables it, even if the other conditions match. The gate is `isDevFlagOverrideEnabled()` in `src/flags/club-features/dev-overrides.ts`.

- Dev deployments are production builds, so `NODE_ENV` cannot tell them apart from production. Enable them only through the explicit env, never with a negative check like `NEXT_PUBLIC_APP_ENV !== 'production'`.
- Amplify SSR reads runtime env only from `.env.production`, which `amplify.yml` writes from an allowlist. `ENABLE_DEV_FLAG_OVERRIDES` is in that list; setting it in the Amplify console is enough.
- The cookie value is URL-encoded JSON keyed by **flag names** (Flagsmith feature names), for example `{"club_warning_enabled":true}`. Names outside `[A-Za-z0-9_.-]{1,64}`, non-boolean values, and entries beyond 30 are ignored. It applies to every club in that browser. `getClubFeatures` applies it on top of the fetched values, so an override only changes behavior for names registered in `CLUB_FEATURE_FLAGS`.
- It must be a cookie, not localStorage: flag values are resolved during the server render.

Where overrides are allowed, the club layout renders `DevFlagPanel` (`src/components/dev/`) at the bottom left. It is loaded through `LazyDevFlagPanel` (`next/dynamic`); a static import would ship the panel and the Flagsmith SDK in the layout bundle even where it never renders. The panel lists only the flags the developer put in, each with a switch; deleting one falls back to the Flagsmith value. Flags go in two ways: typing a flag name (added as ON, for flags not created in Flagsmith yet), or 전체 플래그에서 고르기, which fetches every flag for the current club identity on demand (`getAllFeatureFlags` in `src/lib/flagsmith.ts`, React Query) and adds the chosen one with its current value. Each change writes the cookie and calls `router.refresh()`.

Design verification specs set the cookie through `test.use({ flagOverrides: { warningEnabled: true } })` in `e2e/design/design-helpers.ts`. The fixture takes `ClubFeatures` property names and converts them to flag names (`toDevFlagOverrides`), and hides the panel (`[data-dev-overlay]`). Do not add other environment-variable or hardcoded overrides for local checks.
