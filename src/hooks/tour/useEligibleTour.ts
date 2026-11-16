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
  const { requestStart, finish } = useTourActions();

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

  // 락의 획득과 해제를 같은 effect, 같은 의존성(candidate)에 묶는다. activeTourId를 의존성에
  // 넣지 않는 게 중요하다 — 넣으면 requestStart가 만든 그 변화 때문에 즉시 재실행되어 cleanup이
  // 등록되자마자 버려진다(Strict Mode의 mount→cleanup→remount 재생에서 락이 영구히 풀려버림).
  useEffect(() => {
    if (!candidate) return;
    const acquired = requestStart(candidate.id);
    if (!acquired) return; // 다른 투어가 이미 점유 중 — 우리가 쥔 락이 아니므로 해제 책임도 없다.
    return () => {
      finish();
    };
  }, [candidate, finish, requestStart]);

  // 이미 시작된 투어라도 억제자가 새로 뜨면(예: 홈 튜토리얼이 뒤늦게 열림) candidate가 null이 되어
  // 위 effect가 즉시 락을 해제한다. 여기서도 한 번 더 막아 그 사이의 한 프레임 노출을 없앤다.
  if (!activeTourId || isSuppressed) return null;
  return listRegisteredTours().find((tour) => tour.id === activeTourId) ?? null;
}

export { useEligibleTour };
