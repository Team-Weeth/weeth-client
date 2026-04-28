import type { ReactNode } from 'react';

import { Header } from '@/components/admin/layout/Header';
import { LNB } from '@/components/admin/layout/LNB';
import { homeServerApi } from '@/lib/apis/home.server';
import { AdminScopeProvider, ClubIdSyncer } from '@/providers';
import { UserHydrator } from '@/providers/user-hydrator';

export default async function AdminLayout({
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
      <ClubIdSyncer clubId={clubId}>
        <AdminScopeProvider>
          <div data-admin className="fixed inset-0 flex flex-col">
            <div className="flex flex-1 overflow-hidden">
              <LNB />
              <main className="bg-background flex-1 overflow-x-hidden overflow-y-auto [scrollbar-gutter:stable]">
                <Header />
                {children}
              </main>
            </div>
          </div>
        </AdminScopeProvider>
      </ClubIdSyncer>
    </UserHydrator>
  );
}
