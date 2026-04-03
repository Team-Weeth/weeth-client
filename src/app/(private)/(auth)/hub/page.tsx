import { unstable_rethrow } from 'next/navigation';

import { HubActionCard, HubProfile } from '@/components/auth/hub';
import { apiServer } from '@/lib/apis/server';

type CardVariant = 'create' | 'join' | 'go';

interface MembershipStatusResponse {
  data: {
    hasActiveClub: boolean;
    hasWaitingClub: boolean;
    activeClub: { id: string } | null;
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

  if (intent === 'create') {
    cardOrder = ['create', 'join', 'go'];
  } else {
    const status = await apiServer
      .get<MembershipStatusResponse>('/clubs/membership-status')
      .catch((err) => {
        unstable_rethrow(err);
        return null;
      });
    if (status?.data?.hasActiveClub) {
      goHref = '/home';
      cardOrder = ['go', 'create', 'join'];
    } else {
      cardOrder = ['join', 'create', 'go'];
    }
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
          />
        ))}
      </div>
    </div>
  );
}
