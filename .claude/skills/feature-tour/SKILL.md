---
name: feature-tour
description: "Creates a product tour (spotlight coachmark) for a feature using react-joyride v3, following the Weeth tour architecture in .claude/rules/tour.md. Use when the user says \"투어 만들어줘\", \"온보딩 추가\", \"기능 소개 추가\", \"스포트라이트 추가\", \"코치마크\", \"신규 기능 안내\", or \"product tour\"."
argument-hint: "[feature or route, e.g. admin/penalty 경고 기능]"
allowed-tools: Glob, Grep, Read, Bash, Write, Edit
---

# Feature Tour

Creates a product tour that spotlights one piece of UI so users notice a feature that shipped silently.

## Arguments

Receives a feature description or route via `$ARGUMENTS`.

- `/feature-tour admin/penalty 경고 기능`
- `/feature-tour` (asks which feature/route if not provided)

## Prerequisites

Read `.claude/rules/tour.md` **before** writing any code. It is the spec for this project's react-joyride usage — react-joyride **v3** (named exports, `useJoyride`, an `options` prop), not the v2 API you may remember. Do not generate Joyride props from memory; copy them from `tour.md` / `template.md`.

## Workflow

### 1. Identify the target UI

Resolve `$ARGUMENTS` against routes under `src/app/(private)/[clubId]/**` and the components they render; `grep` for the feature name if the route isn't obvious.

- If the route is ambiguous, list candidates and ask which one.
- Derive yourself: `scope` (`admin/**` → `admin`, everything else → `main`); which file owns each target element.

### 2. Confirm steps and copy

Propose 2–3 steps as a table: target, title, content, placement, target role(s), and whether it's gated by a feature flag.

- **Always confirm with the user.** User-facing Korean copy is a product decision, not something to decide alone. Present the table and ask for approval or edits.
- Derive yourself: step order, a first-draft placement inferred from the target's position in the layout.

### 3. Pre-flight check

Check: is `react-joyride` installed; does `.claude/rules/tour.md` exist; does `src/tours/` infrastructure exist.

- If the infrastructure doesn't exist yet, say so and **stop**: "투어 인프라가 아직 없습니다. 먼저 인프라를 구축해야 합니다." This skill creates one tour, not the whole system.
- If `react-joyride` isn't installed, report it as an action item — do not run `pnpm add` yourself.

### 4. Create the definition file

Use [template.md](template.md) to write `src/tours/definitions/{tour-id}.tsx`: the `{ID}_TARGETS` map + the `TourDefinition`.

- Decide yourself: `version: 1`; `priority` = current registry max + 10; `startDelayMs: 600` (skeleton → content render buffer); `match` as `pathname.endsWith(...)`.

### 5. Attach `data-tour`

Spread `tourTarget(X_TARGETS.foo)` onto each target component.

- If the target component doesn't forward `...props` to its root DOM node, ask whether to widen its props or wrap it — don't silently change its public API.
- Decide yourself: which DOM node is the right spotlight boundary (the smallest element that reads as "that feature").

### 6. Register the tour

Add the entry to `TOUR_REGISTRY` and the `TourId` union.

### 7. Wire the feature flag (if gated)

If the target feature is behind a club feature flag, set `requiresFeature` to that flag's key and confirm it exists in `CLUB_FEATURE_FLAGS`.

- If no flag exists yet, ask whether to add one — and note that it also needs to be created in Flagsmith.
- Never create a tour-only flag.

### 8. Confirm the mount point

`grep` for `TourMount` in both layouts; add it to whichever layout matches this tour's `scope` if missing.

### 9. Analytics

Confirm `TourRunner` already emits all five standard events with `tour_id` — no new code needed unless this tour needs a tour-specific property.

### 10. Tests

Add a case to `registry.test.ts`, append a case to `e2e/specs/tour.spec.ts`. Run `pnpm test src/tours src/components/tour` and `pnpm typecheck`.

### 11. Summary

Report: files changed; the approved copy as a table; a "⚠️ Human follow-ups" list — Flagsmith flag/segment creation, `pnpm add` if needed, copy/design review, enabling the e2e test's club flag, and remembering to bump `version` if copy changes later.

---

## Notes

- This skill never scaffolds `src/tours/` infrastructure itself — step 3 stops early if it's missing.
- Never invent react-joyride v2 props (`callback`, `styles.options`, `disableOverlayClose`, …). See the migration table in `.claude/rules/tour.md`.
