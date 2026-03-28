import { ClubWelcomePage } from '@/components/auth/hub';

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ userName?: string | string[] }>;
}) {
  const { userName } = await searchParams;
  const resolvedUserName = Array.isArray(userName) ? userName[0] : userName;
  return <ClubWelcomePage userName={resolvedUserName ?? 'OOO'} />;
}
