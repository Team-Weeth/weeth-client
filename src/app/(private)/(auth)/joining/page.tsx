import { ClubJoiningPage } from '@/components/auth/hub';

export default async function JoiningPage({
  searchParams,
}: {
  searchParams: Promise<{ clubName?: string | string[] }>;
}) {
  const { clubName } = await searchParams;
  const resolvedClubName = Array.isArray(clubName) ? clubName[0] : clubName;
  return <ClubJoiningPage clubName={resolvedClubName ?? '동아리'} />;
}
