'use client';

import { useParams, useRouter } from 'next/navigation';

import { ClubConfirmCard } from '@/components/auth/invite';

export default function InvitePage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();

  // TODO: API로 code에 해당하는 동아리 정보 조회
  const club = {
    id: '1',
    name: '가천대 검도부',
    description: '날씨가 춥네요, 건강이 최고',
    logoUrl: undefined,
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <ClubConfirmCard club={club} onConfirm={() => router.push(`/login?invite=${code}`)} />
    </div>
  );
}
