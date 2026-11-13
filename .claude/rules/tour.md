# Product Tour

A product tour spotlights a single piece of UI for one or two steps so users notice a feature that shipped silently (most often behind a club feature flag). It is not a replacement for `HomeTutorialDialog` (multi-step carousel onboarding) or `DuesOnboardingOverlay` (area-dimming overlay) — those stay as they are. A tour targets one concrete element via a CSS selector.

## Version Pin — react-joyride 3.2.0

**v3 is a full API rewrite.** Every blog post, Stack Overflow answer, and most model training data describe v2. Do not write v2 code.

| v2 (what you remember) | v3.2.0 (actual) |
| --- | --- |
| `import Joyride from 'react-joyride'` | No default export. `import { Joyride, useJoyride } from 'react-joyride'` |
| `callback` prop | `onEvent?: EventHandler` |
| `styles.options.zIndex` | `styles.options` removed → top-level `options?: Partial<Options>` |
| `disableOverlayClose` | `overlayClickAction: 'close' \| 'next' \| 'replay' \| false` |
| `spotlightClicks` | `blockTargetInteraction` — meaning is inverted |
| `disableScrollParentFix` | removed (Floating UI handles it) |
| `floaterProps` | `floatingOptions?: Partial<FloatingOptions>` |
| `disableScrolling` | `skipScroll` |
| `showSkipButton` / `hideBackButton` / `hideCloseButton` | unified into `buttons: ('back'\|'close'\|'primary'\|'skip')[]` |
| `disableBeacon` (step) | `skipBeacon` |
| `styles.buttonNext` | `styles.buttonPrimary` |
| `run` default `true` | `run` default `false` |
| `scrollToFirstStep` default — not an issue in v2 | defaults to `false` in v3. First step can be off-screen if you don't set it `true` |

This project uses `useJoyride()` only — never the `<Joyride>` component. The hook returns `{ Tour, controls, state, step, on, failures }`: `controls.start()` for imperative control, `on(eventType, handler)` for typed events, `failures: StepFailure[]` for selector-rot telemetry.

`targetWaitTimeout` (default `1000ms`) already polls for the target and auto-advances with `EVENTS.TARGET_NOT_FOUND` on timeout — do not build a `MutationObserver` / "target ready" helper, it is redundant.

## Files

| Path | Responsibility |
| --- | --- |
| `src/tours/types.ts` | `TourId`, `TourScope`, `TourTargetId`, `TourDefinition` |
| `src/tours/config.ts` | `TOUR_BASE_OPTIONS`, `TOUR_LOCALE`, `TOUR_Z_INDEX` — the only place numeric literals live |
| `src/tours/target.ts` | `tourTarget()` / `tourSelector()` |
| `src/tours/registry.ts` | `TOUR_REGISTRY` + `selectEligibleTour(tours, input)` (pure function — takes its candidates as an argument, never reaches into `TOUR_REGISTRY` itself) |
| `src/tours/analytics.ts` | the only place PostHog event names exist |
| `src/tours/definitions/{tour-id}.tsx` | one file per **shipped** tour: target map + `TourDefinition`, registered in `TOUR_REGISTRY` |
| `src/tours/examples/` | reference-only tours (e.g. `admin-warning.example.tsx`) — demonstrate the pattern end-to-end, never registered in `TOUR_REGISTRY`, never wired into a real component |
| `src/components/tour/TourMount.tsx` | `'use client'` — cheap gate + `next/dynamic` boundary |
| `src/components/tour/TourRunner.tsx` | `'use client'` — `useJoyride`. The only place that imports react-joyride at runtime |
| `src/components/tour/TourTooltip.tsx` | `'use client'` — cva + design tokens |
| `src/hooks/tour/useEligibleTour.ts` | resolves `selectEligibleTour()` against store + route + role + flags |
| `src/stores/useTourStore.ts` | seen state (persisted) + active-tour lock (memory) |
| `src/lib/analytics.ts` | PostHog wrapper (first custom event producer in this repo) |

## Hard Rules

1. `src/tours/**` may only `import type` from `react-joyride`. Runtime import happens in `TourRunner.tsx` only — otherwise the `next/dynamic` boundary is defeated and ~85KB loads on every route.
2. Never call `useClubFeatures()` inside a tour definition or the runner. `TourRunner` mounts above the per-page `ClubFeatureProvider`, so the hook would read `DEFAULT_CLUB_FEATURES` (all `false`) and every flagged tour would silently never run. Features are resolved server-side in the layout and passed down as a prop.
3. Never pass `portalElement`. It changes how the overlay sizes itself and fails silently (no error, nothing renders) if the selector doesn't match.
4. Every step in one tour definition must live on the route declared by `definition.match`. Multi-route tours are not supported yet (need a `before` step hook + `router.push`).
5. Never target an element inside a Radix `Dialog` / `Sheet` / `Popover`. Radix sets `pointer-events: none` on `<body>` while open, which hides the spotlight from assistive tech and blocks clicks. Use a suppressor instead (see Gating Matrix).
6. No raw colors — see Token Bridge. Numeric literals live only in `src/tours/config.ts`.
7. Only one tour runs at a time (the `activeTourId` lock in `useTourStore`). Bump `definition.version` whenever a tour's copy or steps change so users who already saw it see it again.

## Target Convention

```ts
// src/tours/types.ts
/**
 * `<tour-id>.<step-id>` — the attribute value and the selector both derive from this one literal.
 * Generic over `string`, not `TourId` — a tour's own shape doesn't depend on whether it is
 * registered in TOUR_REGISTRY yet (see src/tours/examples/).
 */
type TourTargetId<T extends string = string> = `${T}.${string}`;
```

```ts
// src/tours/target.ts
const TOUR_TARGET_ATTRIBUTE = 'data-tour';

/** Spread onto the target: <div {...tourTarget(T.typeToggle)} /> */
function tourTarget(id: TourTargetId) {
  return { [TOUR_TARGET_ATTRIBUTE]: id } as { 'data-tour': TourTargetId };
}

/** Use in step.target: '[data-tour="admin-warning.type-toggle"]' */
function tourSelector(id: TourTargetId) {
  return `[${TOUR_TARGET_ATTRIBUTE}="${id}"]`;
}
```

Every tour definition exports a frozen target map; both the target component and the step reference the same literal through that map — this is what actually prevents drift, not the helper functions alone:

```ts
// src/tours/definitions/admin-warning.tsx — example
const ADMIN_WARNING_TARGETS = {
  typeToggle: 'admin-warning.type-toggle',
} as const satisfies Record<string, TourTargetId<'admin-warning'>>;
```

`registry.test.ts` asserts every `step.target` equals `tourSelector()` of a value from that tour's target map, prefixed with `${id}.`.

## Token Bridge

Verified `Options` keys (from v3.2.0 `src/types/common.ts`): `overlayColor backgroundColor arrowColor textColor primaryColor width zIndex spotlightPadding spotlightRadius offset arrowSize arrowBase scrollOffset skipBeacon showProgress buttons blockTargetInteraction overlayClickAction dismissKeyAction targetWaitTimeout closeButtonAction disableFocusTrap skipScroll hideOverlay` and `before`/`after` hooks.

"No hardcoded values" resolves in three layers:

1. **Color → `var()` string.** `options.overlayColor` flows into `styles.overlay.backgroundColor`, consumed as the overlay SVG `<path>`'s `fill`. `fill="var(--color-overlay-dim)"` resolves because the token is already declared on `:root` and `.dark` in `globals.css` — dark mode works for free. Reuse existing tokens: `--color-overlay-dim`, `--color-container-floating`, `--color-text-on-floating`, `--color-floating-border`.
2. **Numbers → named constants in `src/tours/config.ts`.** `zIndex` / `spotlightRadius` / padding are typed `number`, so `var()` is not possible. Keep them in one file with a comment explaining why they're literals.
3. **Everything else → our `tooltipComponent`.** Use Tailwind token classes only. Never touch `styles.tooltip*` / `styles.button*`. The only `styles` key this project sets is the spotlight ring (`styles.spotlight`, typed `SVGAttributes<SVGPathElement>` in v3).

Request exactly one new token (confirm with the user per `design-tokens.md`'s "Adding New Tokens"):

```css
--tour-tooltip-width: min(320px, calc(100vw - 32px)); /* v3 default of 380px is wider than our 360px mobile base */
```

```ts
// src/tours/config.ts
const TOUR_Z_INDEX = 110; // above ui/Tooltip's z-[100], below the global z-[9999] toaster

const TOUR_BASE_OPTIONS = {
  overlayColor: 'var(--color-overlay-dim)',
  backgroundColor: 'var(--color-container-floating)',
  arrowColor: 'var(--color-container-floating)',
  textColor: 'var(--color-text-on-floating)',
  primaryColor: 'var(--color-button-primary)',
  width: 'var(--tour-tooltip-width)',
  zIndex: TOUR_Z_INDEX,
  spotlightPadding: 8,
  spotlightRadius: 12, // = --radius-md
  offset: 12,
  arrowSize: 10,
  arrowBase: 20,
  scrollOffset: 96, // clears the sticky Header
  skipBeacon: true,
  showProgress: false, // the step counter is rendered by TourTooltip itself
  buttons: ['skip', 'primary'],
  blockTargetInteraction: false,
  overlayClickAction: 'close',
  dismissKeyAction: 'close',
  targetWaitTimeout: 3000,
  closeButtonAction: 'skip',
} satisfies Partial<Options>;
```

`TourTooltip` reuses `Button` and wraps its content in `AdminScopeBoundary` — the tooltip is portaled to `document.body`, outside `[data-admin]`, so without the boundary it loses the admin typography scale. Spread `tooltipProps` / `primaryProps` / `skipProps` onto the DOM — they already carry `role`, `aria-modal`, `aria-label`, and `onClick`; never rebuild them by hand.

### Standardised vs Overridable Props

| Fixed — do not change per tour | Overridable per tour/step |
| --- | --- |
| `continuous`, `scrollToFirstStep`, `tooltipComponent`, `locale`, every color, `width`, `zIndex`, `skipBeacon`, `showProgress`, `buttons`, `overlayClickAction`, `dismissKeyAction`, `targetWaitTimeout`, `closeButtonAction`, `styles.spotlight`, `floatingOptions` | `step.target`, `step.id`, `step.title`, `step.content`, `step.placement`, `step.spotlightPadding`, `step.isFixed`, `step.blockTargetInteraction`, `definition.startDelayMs` |

## Gating Matrix

`selectEligibleTour()` is a pure, synchronous function — no `MutationObserver`, no async polling (v3's `targetWaitTimeout` already covers the DOM side).

| Gate | Source | On failure |
| --- | --- | --- |
| Store rehydrated | `useTourStore().hasHydrated` | Render nothing |
| Scope matches | `definition.scope` vs the mount's `scope` prop | Tour skipped |
| Route matches | `definition.match(pathname)` | Tour skipped |
| Role allowed | `useUserRole()` | Tour skipped |
| Feature flag on | `features[requiresFeature]` (prop from the RSC layout) | Tour skipped |
| Not seen at this version | `completed[key] < version` | Tour skipped |
| No suppressors | `suppressors.length === 0` | Render nothing |
| Lock acquired | `requestStart(tour.id) === true` | Render nothing |

Only one tour is active at a time — a single `activeTourId` slot in `useTourStore`. A modal that currently occupies the screen (e.g. `HomeTutorialDialog`) registers as a suppressor while open; this also covers `NoticePopup` and future modals without new gating code.

## z-index Ladder

| Layer | Value | Example |
| --- | --- | --- |
| Page-level overlays | `z-10` – `z-50` | `NoticePopup`, editor floating menus |
| Popover-family (Radix) | `z-90` | `popover`, `DropdownMenu`, `CalendarPicker`, `alert-dialog`, `TimePicker` |
| `ui/Tooltip` | `z-[100]` | hover tooltips |
| **Product tour** | `z-[110]` (`TOUR_Z_INDEX`) | tour overlay + spotlight |
| Toaster | `z-[9999]` | `Toast` |

This ladder was previously undocumented, which is how `Toast` ended up at `z-[9999]` with nothing between it and `z-90`. Place any new global overlay by this table, not by guessing a large number.

## Analytics

`src/lib/analytics.ts` wraps PostHog (the first custom event producer in this repo — `posthog.init()` already runs in `instrumentation-client.ts`, nothing calls `capture()` yet):

```ts
function trackEvent(name: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (!posthog.__loaded) return; // no key / non-prod — no-op, never throws
  posthog.capture(name, properties);
}
```

| Event | v3 signal | Properties |
| --- | --- | --- |
| `tour_started` | `EVENTS.TOUR_START` | `tour_id tour_version club_id scope step_count` |
| `tour_step_viewed` | `EVENTS.TOOLTIP` | `+ step_id step_index` |
| `tour_completed` | `EVENTS.TOUR_END && status === STATUS.FINISHED` | `+ duration_ms` |
| `tour_skipped` | `EVENTS.TOUR_END && status !== FINISHED` | `+ step_id step_index origin` |
| `tour_step_failed` | `EVENTS.TARGET_NOT_FOUND` | `+ step_id reason` |

`tour_step_failed` is not optional: v3 silently advances past a missing target, so this is the only signal that a `data-tour` attribute was removed by an unrelated refactor. `origin` comes from v3's `ORIGIN` enum (`button_skip` / `button_close` / `overlay` / `keyboard`) — it distinguishes "not interested" from "closed by accident". `tour_step_viewed` fires on `EVENTS.TOOLTIP`, not `STEP_BEFORE`, so a step that auto-advanced on timeout is not counted as "viewed". Event names live only in `src/tours/analytics.ts`.

## Accessibility & Mobile

v3 already provides these — do not reimplement: focus trap (`disableFocusTrap: false` by default, traps Tab/Shift-Tab inside the tooltip, restores previous focus with `preventScroll: true` on unmount), `ESC` (`dismissKeyAction`), ARIA (`role` + `aria-modal` on `tooltipProps`, `aria-label` on the button prop bundles).

| Case | Handling |
| --- | --- |
| `prefers-reduced-motion` | `useSyncExternalStore` + `matchMedia` → `scrollDuration: 0`, `floatingOptions.autoUpdate.animationFrame: false`, a `@media` rule on the tooltip's enter animation. Not handled anywhere else in this repo today — this is new. |
| Target unmounts/hidden | v3 polls for `targetWaitTimeout: 3000`, then `TARGET_NOT_FOUND` + auto-advance. Rule: every step in a tour stays on the one route `match` declares. |
| Scroll containers | `admin/layout.tsx` scrolls via `<main className="overflow-y-auto">`; `(main)` scrolls the document. v3 resolves the scrollparent on its own — don't pass `portalElement`. `scrollOffset: 96` clears the sticky `Header`. |
| `portalElement` | Never set it (see Hard Rules). |
| Radix Dialog/Sheet/Popover as a target | Not supported — use a suppressor and wait for the modal to close. |
| Mobile (majority of users) | `width: var(--tour-tooltip-width)`; prefer `placement: 'bottom'` / `'auto'`; `shiftOptions.padding: 12`; `scrollToFirstStep: true` is mandatory. Keep steps ≤ 3, copy ≤ 2 lines. |
| `HomeTutorialButton` FAB | Fixed bottom-right on Home. Home-route tour steps should avoid bottom-right placement. |
| Capacitor shell | `@capacitor/*` is a dependency. If a bottom-placed step clips on a notched device, apply `env(safe-area-inset-bottom)` — verify on a real device during the pilot. |

## Adding a Tour

1. Identify the target route/component, pick `scope` (`admin/**` → `admin`, everything else → `main`).
2. Draft 2–3 steps: target, title, content, placement — confirm copy with a human, it's user-facing text.
3. Create `src/tours/definitions/{tour-id}.tsx`: target map + `TourDefinition`. `priority` = current max + 10. `version: 1`.
4. Spread `tourTarget(...)` onto each target element.
5. Register the tour in `TOUR_REGISTRY` and the `TourId` union.
6. If gated by a feature, set `requiresFeature` — reuse that feature's flag, never create a tour-only flag.
7. Confirm `TourMount` is present in the layout for this `scope`.
8. Add registry + e2e test cases. Run `pnpm test src/tours src/components/tour` and `pnpm typecheck`.

(The `/feature-tour` skill automates and expands this checklist.)

## Testing

| Target | File | Approach |
| --- | --- | --- |
| Registry invariants | `src/tours/__tests__/registry.test.ts` | Unique `id`/`priority`; `version >= 1`; every `step.target` matches that tour's target map via `tourSelector()`; `jest.mock('react-joyride', () => { throw ... })` then `require('@/tours/registry')` to catch any accidental runtime import |
| Selector helper | `src/tours/__tests__/target.test.ts` | Round-trip: render `<div {...tourTarget(id)} />`, assert `querySelector(tourSelector(id))` finds it |
| Seen state / lock | `src/stores/__tests__/useTourStore.test.ts` | Key shape; `markSeen` bumps version → re-eligible; second `requestStart` returns `false`; `suppress`/`release` idempotent; `partialize` excludes memory-only fields |
| Eligibility | `src/tours/__tests__/select-eligible-tour.test.ts` | Gating Matrix as `it.each` — pure function, no DOM, no mocks. Highest-ROI test in this whole area |
| Tooltip | `src/components/tour/__tests__/TourTooltip.test.tsx` | RTL smoke test, step counter, `getByRole('button', { name: '다음' })`, last step hides skip. Assert behavior, never `cva` class names |
| Runner orchestration | `src/components/tour/__tests__/TourRunner.test.tsx` | `jsdom` has no layout engine — `getBoundingClientRect` returns zeros, so the real `Joyride` can't position anything. Replace `useJoyride` with a fake exposing an event registry + a `controls.start` spy; drive `TOUR_START → TOOLTIP → TOUR_END(FINISHED)` |
| Analytics wrapper | `src/lib/__tests__/analytics.test.ts` | No-op when `posthog.__loaded` is falsy |
| Full flow | `e2e/specs/tour.spec.ts` | `getByRole` first; assert tooltip → next → second step → skip → reload shows no tour; separate `ESC` case; no visual snapshot (see `e2e-snapshot-os-mismatch`) |

## Known Pitfalls

See [[react-joyride-nextjs-투어]] in `docs/트러블슈팅/` for the full writeup. Short version: this is react-joyride **v3**, not the v2 everyone remembers (see Version Pin above); the tooltip is portaled outside `[data-admin]`; and Radix's `pointer-events: none` on `<body>` kills the spotlight underneath an open dialog.
