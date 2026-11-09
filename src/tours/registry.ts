import type { ClubFeatures } from '@/flags/club-features/definitions';
import type { Role } from '@/types/user';
import type { TourDefinition, TourId, TourScope } from './types';

/** No tour ships yet — the next "Adding a Tour" (.claude/rules/tour.md) adds the first entry here. */
const TOUR_REGISTRY = {} satisfies Record<TourId, TourDefinition>;

/**
 * `Object.values`/`Object.entries` degrade to `{}`/`any[]` for `Record<never, X>` (TourId is
 * `never` until a tour is registered) — this gives callers a properly typed list regardless.
 */
function listRegisteredTours(): TourDefinition[] {
  return Object.values(TOUR_REGISTRY) as TourDefinition[];
}

/** `${userId}:${clubId}:${tourId}` — identifies "seen" independently per user, per club, per tour. */
function getTourSeenKey(userId: number | null, clubId: string, tourId: string): string {
  return `${userId ?? 'anonymous'}:${clubId}:${tourId}`;
}

interface SelectEligibleTourInput {
  scope: TourScope;
  pathname: string;
  role: Role | null;
  features: ClubFeatures;
  completed: Record<string, number>;
  isSuppressed: boolean;
  seenKeyFor: (tourId: string) => string;
}

/**
 * Pure, synchronous — see .claude/rules/tour.md ("Gating Matrix").
 * Takes the candidate tours explicitly (rather than reaching into TOUR_REGISTRY itself) so it stays
 * testable against fixtures — the real caller (useEligibleTour) passes listRegisteredTours().
 */
function selectEligibleTour(
  tours: TourDefinition[],
  input: SelectEligibleTourInput,
): TourDefinition | null {
  if (input.isSuppressed) return null;

  const candidates = tours
    .filter((tour) => tour.scope === input.scope)
    .filter((tour) => tour.match(input.pathname))
    .filter((tour) => !tour.roles || (input.role !== null && tour.roles.includes(input.role)))
    .filter((tour) => !tour.requiresFeature || input.features[tour.requiresFeature])
    .filter((tour) => (input.completed[input.seenKeyFor(tour.id)] ?? -1) < tour.version)
    .sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));

  return candidates.at(0) ?? null;
}

export {
  getTourSeenKey,
  listRegisteredTours,
  selectEligibleTour,
  TOUR_REGISTRY,
  type SelectEligibleTourInput,
};
