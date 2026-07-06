import Link from 'next/link';
import type { ReactNode } from 'react';

import { Header } from '@/components/admin/layout/Header';
import { LNB } from '@/components/admin/layout/LNB';
import { buttonVariants } from '@/components/ui';
import { cn } from '@/lib/cn';
import { homeServerApi } from '@/lib/apis/home.server';
import { ApiError } from '@/lib/apis/server';
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

  const forbidden = (
    <div className="flex min-h-screen flex-col items-center justify-center gap-400">
      <p className="typo-body1 text-text-normal">어드민 유저만 접근 할 수 있어요.</p>
      <Link
        href={`/${clubId}/home`}
        className={cn(buttonVariants({ variant: 'primary', size: 'md' }))}
      >
        홈으로 돌아가기
      </Link>
    </div>
  );

  let dashboard;
  try {
    dashboard = await homeServerApi.getDashboard(clubId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      return forbidden;
    }
    throw error;
  }

  const { data } = dashboard;
  const { userInfo } = data.myInfo;
  const { id: resolvedClubId, name: clubName } = data.club;

  if (userInfo.role !== 'ADMIN' && userInfo.role !== 'LEAD') {
    return forbidden;
  }

  return (
    <UserHydrator userInfo={userInfo} clubInfo={{ clubId: resolvedClubId, clubName }}>
      <ClubIdSyncer clubId={clubId}>
        <AdminScopeProvider>
          <div data-admin className="fixed inset-0 flex flex-col">
            <div className="flex flex-1 overflow-hidden">
              <LNB />
              <main className="bg-background min-w-0 flex-1 overflow-x-auto overflow-y-auto">
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
