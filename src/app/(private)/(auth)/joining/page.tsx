import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { ClubJoiningPage } from '@/components/auth/hub/ClubJoiningPage';

export const metadata: Metadata = { title: '가입 신청' };

export default async function JoiningPage({
  searchParams,
}: {
  searchParams: Promise<{ clubName?: string | string[]; clubId?: string; code?: string }>;
}) {
  const { clubName, clubId, code } = await searchParams;

  if (!clubId || !code) {
    redirect('/hub');
  }

  const resolvedClubName = Array.isArray(clubName) ? clubName[0] : clubName;
  return <ClubJoiningPage clubName={resolvedClubName ?? '동아리'} clubId={clubId} code={code} />;
}
