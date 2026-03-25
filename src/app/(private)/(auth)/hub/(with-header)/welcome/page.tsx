import { ClubWelcomePage } from '@/components/auth/hub';

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ userName?: string }>;
}) {
  const { userName = 'OOO' } = await searchParams;
  return <ClubWelcomePage userName={userName} />;
}
