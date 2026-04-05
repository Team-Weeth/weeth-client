import { LoginPageClient } from '@/components/auth/LoginPageClient';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    terms?: string;
    intent?: string;
    clubId?: string;
    code?: string;
    redirect?: string | string[];
  }>;
}) {
  const { terms, intent, clubId, code, redirect } = await searchParams;
  const resolvedRedirect = Array.isArray(redirect) ? redirect[0] : redirect;
  return (
    <LoginPageClient
      defaultTermsOpen={terms === 'true'}
      intent={intent}
      clubId={clubId}
      code={code}
      redirectPath={resolvedRedirect}
    />
  );
}
