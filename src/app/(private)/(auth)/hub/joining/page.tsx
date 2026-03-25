import { ClubJoiningPage } from '@/components/auth/hub';

export default async function JoiningPage({
  searchParams,
}: {
  searchParams: Promise<{ clubName?: string }>;
}) {
  const { clubName = '동아리' } = await searchParams;
  return <ClubJoiningPage clubName={clubName} />;
}
