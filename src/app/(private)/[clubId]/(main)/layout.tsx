import type { ReactNode } from 'react';

import { getClubFeatures } from '@/flags/club-features/server';
import { homeServerApi } from '@/lib/apis/home.server';
import { ClubFeatureProvider } from '@/providers/club-feature-provider';
import { UserHydrator } from '@/providers/user-hydrator';
import { FeedbackAnalytics } from '@/components/feedback/FeedbackAnalytics';
import { FeedbackFab } from '@/components/feedback/FeedbackFab';
import { Header, ScrollRestoration } from '@/components/layout';

export default async function MainLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ clubId: string }>;
}>) {
  const { clubId } = await params;

  const [{ data }, features] = await Promise.all([
    homeServerApi.getDashboard(clubId),
    getClubFeatures(clubId),
  ]);
  const { userInfo } = data.myInfo;
  const { id: resolvedClubId, name: clubName } = data.club;

  return (
    <UserHydrator userInfo={userInfo} clubInfo={{ clubId: resolvedClubId, clubName }}>
      <ClubFeatureProvider key={clubId} features={features}>
        <FeedbackAnalytics userId={userInfo.id} clubId={resolvedClubId} />
        <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col">
          <ScrollRestoration />
          <Header />
          {children}
        </div>
        <FeedbackFab />
      </ClubFeatureProvider>
    </UserHydrator>
  );
}
