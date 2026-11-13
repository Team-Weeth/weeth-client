# Tour Definition Template

Scaffold for `src/tours/definitions/{{TOUR_ID}}.tsx`. Replace every `{{PLACEHOLDER}}`. See `.claude/rules/tour.md` for the full spec — this is react-joyride **v3** (`import type` only from `'react-joyride'`; the runtime import lives in `TourRunner.tsx`, never here).

```tsx
import { tourSelector, tourTarget } from '@/tours/target';

import type { TourDefinition, TourTargetId } from '@/tours/types';
import type { Step } from 'react-joyride';

const {{ID}}_TARGETS = {
  {{stepKey}}: '{{TOUR_ID}}.{{step-id}}',
  // one entry per step — add more as needed
} as const satisfies Record<string, TourTargetId<'{{TOUR_ID}}'>>;

const {{ID}}_STEPS: Step[] = [
  {
    id: '{{step-id}}',
    target: tourSelector({{ID}}_TARGETS.{{stepKey}}),
    title: '{{제목 — 사용자 승인 문구}}',
    content: '{{본문 — 2줄 이내, 사용자 승인 문구}}',
    placement: '{{bottom-start | bottom | top | auto | ...}}',
  },
  // additional steps
];

const {{ID}}_TOUR: TourDefinition<'{{TOUR_ID}}'> = {
  id: '{{TOUR_ID}}',
  version: 1,
  scope: '{{main | admin}}',
  priority: {{current max + 10}},
  match: (pathname) => pathname.endsWith('{{/route/path}}'),
  roles: [{{'ADMIN', 'LEAD' | omit for everyone}}],
  requiresFeature: {{'warningEnabled' | omit if not flag-gated}},
  startDelayMs: 600,
  steps: {{ID}}_STEPS,
};

export { {{ID}}_TARGETS, {{ID}}_TOUR };
```

## Target component — the only change at the call site

```tsx
<SomeField label="..." {...tourTarget({{ID}}_TARGETS.{{stepKey}})}>
```

## Registering

```ts
// src/tours/registry.ts
import { {{ID}}_TOUR } from './definitions/{{TOUR_ID}}';

const TOUR_REGISTRY = {
  // ...existing tours
  {{TOUR_ID}}: {{ID}}_TOUR,
} satisfies Record<TourId, TourDefinition>;
```

```ts
// src/tours/types.ts
type TourId = /* existing ids */ | '{{TOUR_ID}}';
```

## Reference — full `admin-warning` example (from `.claude/rules/tour.md`)

```tsx
const ADMIN_WARNING_TARGETS = {
  typeToggle: 'admin-warning.type-toggle',
} as const satisfies Record<string, TourTargetId<'admin-warning'>>;

const ADMIN_WARNING_TOUR: TourDefinition<'admin-warning'> = {
  id: 'admin-warning',
  version: 1,
  scope: 'admin',
  priority: 10,
  match: (pathname) => pathname.endsWith('/admin/penalty'),
  roles: ['ADMIN', 'LEAD'],
  requiresFeature: 'warningEnabled',
  startDelayMs: 600,
  steps: [
    {
      id: 'type-toggle',
      target: tourSelector(ADMIN_WARNING_TARGETS.typeToggle),
      title: '경고를 따로 기록할 수 있어요',
      content: '페널티보다 가벼운 사안은 "경고"로 남겨보세요.',
      placement: 'bottom-start',
    },
  ],
};
```

## Checklist before handing back to the user

- [ ] Every `step.target` goes through `tourSelector()` on a value from `{{ID}}_TARGETS`
- [ ] `priority` is unique across the registry
- [ ] Copy was shown to and approved by the user
- [ ] `requiresFeature` (if set) reuses an existing `ClubFeatures` key — never a tour-only flag
- [ ] `TourMount` exists in the layout matching this tour's `scope`
- [ ] Added to `registry.test.ts` and `e2e/specs/tour.spec.ts`
