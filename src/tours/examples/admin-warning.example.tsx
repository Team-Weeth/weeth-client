import { tourSelector } from '../target';

import type { TourDefinition, TourTargetId } from '../types';
import type { Step } from 'react-joyride';

/**
 * EXAMPLE ONLY — not registered in TOUR_REGISTRY, not shipped to users.
 *
 * Demonstrates the full .claude/rules/tour.md pattern end-to-end (target map, step, definition)
 * against the real `warningEnabled` feature flag and the real admin/penalty "구분" toggle.
 * This repo's own tests exercise it to prove the tour infrastructure works; it was never wired
 * into any production component. Copy this file's shape when writing a real tour — see the
 * `/feature-tour` skill and `.claude/skills/feature-tour/template.md`.
 */
const EXAMPLE_ADMIN_WARNING_TARGETS = {
  typeToggle: 'admin-warning.type-toggle',
} as const satisfies Record<string, TourTargetId<'admin-warning'>>;

const EXAMPLE_ADMIN_WARNING_STEPS: Step[] = [
  {
    id: 'type-toggle',
    target: tourSelector(EXAMPLE_ADMIN_WARNING_TARGETS.typeToggle),
    title: '경고를 따로 기록할 수 있어요',
    content: '페널티보다 가벼운 사안은 "경고"로 남겨보세요.',
    placement: 'bottom-start',
  },
];

const EXAMPLE_ADMIN_WARNING_TOUR: TourDefinition<'admin-warning'> = {
  id: 'admin-warning',
  version: 1,
  scope: 'admin',
  priority: 10,
  match: (pathname) => pathname.endsWith('/admin/penalty'),
  roles: ['ADMIN', 'LEAD'],
  requiresFeature: 'warningEnabled',
  startDelayMs: 600,
  steps: EXAMPLE_ADMIN_WARNING_STEPS,
};

export { EXAMPLE_ADMIN_WARNING_TARGETS, EXAMPLE_ADMIN_WARNING_TOUR };
