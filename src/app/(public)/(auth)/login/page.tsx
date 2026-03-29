import { LoginPageClient } from '@/components/auth/LoginPageClient';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ terms?: string; intent?: string }>;
}) {
  const { terms, intent } = await searchParams;
  return <LoginPageClient defaultTermsOpen={terms === 'true'} intent={intent} />;
}
