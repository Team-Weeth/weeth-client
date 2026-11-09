import type { ClubFeatures } from '@/flags/club-features/definitions';
import type { Role } from '@/types/user';
import type { Step } from 'react-joyride';

/**
 * Union of ids that are actually registered in TOUR_REGISTRY and shipped to users.
 * No tour ships yet — `never` until "Adding a Tour" step 5 adds a real id here.
 * A tour definition's own generic (below) is NOT constrained to this — see src/tours/examples/
 * for a reference implementation that is never registered.
 */
type TourId = never;

type TourScope = 'main' | 'admin';

/** `<tour-id>.<step-id>` — the attribute value and the selector both derive from this one literal. */
type TourTargetId<T extends string = string> = `${T}.${string}`;

interface TourDefinition<T extends string = string> {
  id: T;
  /** Bump when a tour's content changes so users who already saw it see it again. */
  version: number;
  scope: TourScope;
  /** Lower runs first. Must be unique across the registry. */
  priority: number;
  match: (pathname: string) => boolean;
  /** Empty/omitted allows every role. */
  roles?: Role[];
  requiresFeature?: keyof ClubFeatures;
  /** Skeleton → content render buffer, in ms. */
  startDelayMs?: number;
  steps: Step[];
}

export type { TourDefinition, TourId, TourScope, TourTargetId };
