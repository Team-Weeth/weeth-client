import type { ReactNode } from 'react';

import { homeServerApi } from '@/lib/apis/home.server';
import { UserHydrator } from '@/providers/user-hydrator';
import { ClubGuard, Header } from '@/components/layout';

// TODO: 하드코딩된 clubId 추후 동적으로 변경
export default async function MainLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { data } = await homeServerApi.getDashboard('YUNJcjFKMO');
  const { userInfo } = data.myInfo;
  const { id: clubId, name: clubName } = data.club;

  return (
    <ClubGuard>
      <UserHydrator userInfo={userInfo} clubInfo={{ clubId, clubName }}>
        <div className="mx-auto flex h-screen max-w-[1440px] flex-col">
          <Header />
          {children}
        </div>
      </UserHydrator>
    </ClubGuard>
  );
}
