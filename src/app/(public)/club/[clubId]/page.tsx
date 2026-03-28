'use client';

import { ClubAccessPage } from '@/components/auth/invite';

export default function ClubPage() {
  // TODO: API로 clubId에 해당하는 동아리 정보 조회
  const club = {
    id: '1',
    name: '가천대 검도부',
    description: '날씨가 춥네요, 건강이 최고',
    logoUrl: undefined,
  };

  return <ClubAccessPage club={club} />;
}
