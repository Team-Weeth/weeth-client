import { LoginPageClient } from '@/components/auth/LoginPageClient';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ terms?: string }>;
}) {
  const { terms } = await searchParams;
  return <LoginPageClient defaultTermsOpen={terms === 'true'} />;
}
