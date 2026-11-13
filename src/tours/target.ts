import type { TourTargetId } from './types';

const TOUR_TARGET_ATTRIBUTE = 'data-tour';

/** Spread onto the target element: `<div {...tourTarget(T.typeToggle)} />` */
function tourTarget(id: TourTargetId) {
  return { [TOUR_TARGET_ATTRIBUTE]: id } as { 'data-tour': TourTargetId };
}

/** Use in `step.target`: `'[data-tour="admin-warning.type-toggle"]'` */
function tourSelector(id: TourTargetId) {
  return `[${TOUR_TARGET_ATTRIBUTE}="${id}"]`;
}

export { tourSelector, tourTarget, TOUR_TARGET_ATTRIBUTE };
