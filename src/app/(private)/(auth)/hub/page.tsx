import { HubActionCard, HubProfile } from '@/components/auth/hub';
import { apiServer } from '@/lib/apis/server';

type CardVariant = 'create' | 'join' | 'go';

interface ClubsResponse {
  data: { id: string }[];
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
    const clubs = await apiServer.get<ClubsResponse>('/clubs').catch(() => null);
    const firstClub = clubs?.data?.[0];
    if (firstClub) {
      goHref = '/home';
      cardOrder = ['go', 'create', 'join'];
    } else {
      cardOrder = ['join', 'create', 'go'];
    }
  }

  const hrefMap: Record<CardVariant, string | undefined> = {
    create: '/hub/create',
    join: '/hub/join',
    go: goHref,
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-600">
      <HubProfile className="flex flex-col items-center gap-600" />
      <div className="flex w-full max-w-[520px] flex-col gap-300 px-400">
        {cardOrder.map((variant, index) => (
          <HubActionCard key={variant} variant={variant} href={hrefMap[variant]} isPrimary={index === 0} />
        ))}
      </div>
    </div>
  );
}
