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

  // 이미 시작된 투어라도 억제자가 새로 뜨면(예: 홈 튜토리얼이 뒤늦게 열림) 더 이상 렌더하지 않는다.
  // TourRunner가 언마운트되며 락을 해제하므로, 억제가 풀리면 자연스럽게 재평가된다.
  if (!activeTourId || isSuppressed) return null;
  return listRegisteredTours().find((tour) => tour.id === activeTourId) ?? null;
}

export { useEligibleTour };
