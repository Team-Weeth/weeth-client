import type { ReactNode } from 'react';

import { homeServerApi } from '@/lib/apis/home.server';
import { UserHydrator } from '@/providers/user-hydrator';
import { Header, ScrollRestoration } from '@/components/layout';

export default async function MainLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ clubId: string }>;
}>) {
  const { clubId } = await params;

  const { data } = await homeServerApi.getDashboard(clubId);
  const { userInfo } = data.myInfo;
  const { id: resolvedClubId, name: clubName } = data.club;

  return (
    <UserHydrator userInfo={userInfo} clubInfo={{ clubId: resolvedClubId, clubName }}>
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col">
        <ScrollRestoration />
        <Header />
        {children}
      </div>
    </UserHydrator>
  );
}
