'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { DEFAULT_CLUB_FEATURES, type ClubFeatures } from '@/flags/club-features/definitions';

const ClubFeaturesContext = createContext<ClubFeatures>(DEFAULT_CLUB_FEATURES);

export function ClubFeatureProvider({
  features,
  children,
}: {
  features: ClubFeatures;
  children: ReactNode;
}) {
  return <ClubFeaturesContext.Provider value={features}>{children}</ClubFeaturesContext.Provider>;
}

// 조회 요청 없이 서버에서 전달한 현재 동아리의 값을 읽는다.
export function useClubFeatures(): ClubFeatures {
  return useContext(ClubFeaturesContext);
}
