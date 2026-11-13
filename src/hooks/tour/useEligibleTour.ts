'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  useActiveTourId,
  useIsTourSuppressed,
  useTourActions,
  useTourCompleted,
  useTourHasHydrated,
  useUserId,
  useUserRole,
} from '@/stores';
import { getTourSeenKey, listRegisteredTours, selectEligibleTour } from '@/tours/registry';

import type { ClubFeatures } from '@/flags/club-features/definitions';
import type { TourDefinition, TourScope } from '@/tours/types';

interface UseEligibleTourInput {
  clubId: string;
  scope: TourScope;
  features: ClubFeatures;
}

/** See .claude/rules/tour.md ("Gating Matrix") — renders nothing until the single-tour lock is acquired. */
function useEligibleTour({ clubId, scope, features }: UseEligibleTourInput): TourDefinition | null {
  const pathname = usePathname();
  const role = useUserRole();
  const userId = useUserId();
  const completed = useTourCompleted();
  const hasHydrated = useTourHasHydrated();
  const isSuppressed = useIsTourSuppressed();
  const activeTourId = useActiveTourId();
  const { requestStart } = useTourActions();

  const candidate = hasHydrated
    ? selectEligibleTour(listRegisteredTours(), {
        scope,
        pathname,
        role,
        features,
        completed,
        isSuppressed,
        seenKeyFor: (tourId) => getTourSeenKey(userId, clubId, tourId),
      })
    : null;

  useEffect(() => {
    if (!candidate || activeTourId) return;
    requestStart(candidate.id);
  }, [activeTourId, candidate, requestStart]);

  if (!activeTourId) return null;
  return listRegisteredTours().find((tour) => tour.id === activeTourId) ?? null;
}

export { useEligibleTour };
