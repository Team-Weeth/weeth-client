import { LoginPageClient } from '@/components/auth/LoginPageClient';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ terms?: string; intent?: string; clubId?: string; code?: string; redirect?: string }>;
}) {
  const { terms, intent, clubId, code, redirect } = await searchParams;
  return (
    <LoginPageClient
      defaultTermsOpen={terms === 'true'}
      intent={intent}
      clubId={clubId}
      code={code}
      redirectPath={redirect}
    />
  );
}
