import { unstable_rethrow } from 'next/navigation';
import { HubActionCard } from '@/components/auth/hub/HubActionCard';
import { HubProfile } from '@/components/auth/hub/HubProfile';
import { apiServer } from '@/lib/apis/server';
import type { ApiResponse } from '@/types/common';
import type { ClubDto } from '@/types/mypage';

type CardVariant = 'create' | 'join' | 'go';

interface MembershipStatusResponse {
  data: {
    hasActiveClub: boolean;
    hasWaitingClub: boolean;
  };
}

export default async function HubPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string }>;
}) {
  const { intent } = await searchParams;

  let cardOrder: CardVariant[];
  let goHref: string | undefined;
  let goClubId: string | undefined;
  let goClubName: string | undefined;

  const status = await apiServer
    .get<MembershipStatusResponse>('/clubs/membership-status')
    .catch((err) => {
      unstable_rethrow(err);
      return null;
    });

  const hasActiveClub = status?.data?.hasActiveClub ?? false;

  if (hasActiveClub) {
    const clubsRes = await apiServer.get<ApiResponse<ClubDto[]>>('/clubs').catch((err) => {
      unstable_rethrow(err);
      return null;
    });
    const clubs = clubsRes?.data ?? [];

    if (clubs.length === 1) {
      const club = clubs[0];
      goHref = `/${club.id}/home`;
      goClubId = club.id;
      goClubName = club.name;
    } else {
      goHref = '/club/select';
    }
  }

  if (intent === 'create') {
    cardOrder = ['create', 'join', 'go'];
  } else if (hasActiveClub) {
    cardOrder = ['go', 'create', 'join'];
  } else {
    cardOrder = ['join', 'create', 'go'];
  }

  const hrefMap: Record<CardVariant, string | undefined> = {
    create: '/club/create',
    join: '/club/join',
    go: goHref,
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-600">
      <HubProfile className="flex flex-col items-center gap-600" />
      <div className="flex w-full max-w-[620px] flex-col gap-300 px-400">
        {cardOrder.map((variant, index) => (
          <HubActionCard
            key={variant}
            variant={variant}
            href={hrefMap[variant]}
            isPrimary={index === 0}
            clubId={variant === 'go' ? goClubId : undefined}
            clubName={variant === 'go' ? goClubName : undefined}
          />
        ))}
      </div>
    </div>
  );
}
