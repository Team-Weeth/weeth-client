import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { WaxEventGame } from '@/components/wax-event/WaxEventGame';
import { getClubFeatures } from '@/flags/club-features/server';

export const metadata: Metadata = { title: '교수님 몰래 왁뿌하기' };

export default async function EventPage({ params }: { params: Promise<{ clubId: string }> }) {
  const { clubId } = await params;
  const { waxEventEnabled } = await getClubFeatures(clubId);
  // 이벤트(게임 운영 스위치)가 꺼져 있으면 진입점이 모두 사라지므로, 주소로 직접 들어와도 홈으로 보낸다.
  if (!waxEventEnabled) redirect(`/${clubId}/home`);

  return <WaxEventGame />;
}
