'use client';

import dynamic from 'next/dynamic';
import { useEligibleTour } from '@/hooks/tour/useEligibleTour';

import type { ClubFeatures } from '@/flags/club-features/definitions';
import type { TourScope } from '@/tours/types';

const TourRunner = dynamic(() => import('./TourRunner').then((m) => m.TourRunner), { ssr: false });

interface TourMountProps {
  clubId: string;
  scope: TourScope;
  features: ClubFeatures;
}

/** Cheap gate + next/dynamic boundary — mount once per layout (`(main)` and `admin`). */
function TourMount({ clubId, scope, features }: TourMountProps) {
  const tour = useEligibleTour({ clubId, scope, features });
  if (!tour) return null;
  return <TourRunner clubId={clubId} tour={tour} />;
}

export { TourMount, type TourMountProps };
