import type { ReactNode } from 'react';
import { cookies } from 'next/headers';

import { homeServerApi } from '@/lib/apis/home.server';
import { CLUB_ID_KEY } from '@/lib/apis/cookies';
import { UserHydrator } from '@/providers/user-hydrator';
import { ClubGuard, Header } from '@/components/layout';

export default async function MainLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const clubId = (await cookies()).get(CLUB_ID_KEY)?.value;
  if (!clubId) return null;

  const { data } = await homeServerApi.getDashboard(clubId);
  const { userInfo } = data.myInfo;
  const { id: resolvedClubId, name: clubName } = data.club;

  return (
    <ClubGuard>
      <UserHydrator userInfo={userInfo} clubInfo={{ clubId: resolvedClubId, clubName }}>
        <div className="mx-auto flex h-screen max-w-[1440px] flex-col">
          <Header />
          {children}
        </div>
      </UserHydrator>
    </ClubGuard>
  );
}
