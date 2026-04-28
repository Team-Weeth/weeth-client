import { cookies } from 'next/headers';
import { redirect as nextRedirect } from 'next/navigation';
import { LoginPageClient } from '@/components/auth/LoginPageClient';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/apis/cookies';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    terms?: string;
    intent?: string;
    clubId?: string;
    code?: string;
    redirect?: string | string[];
    expired?: string;
  }>;
}) {
  const { terms, intent, clubId, code, redirect, expired } = await searchParams;
  const resolvedRedirect = Array.isArray(redirect) ? redirect[0] : redirect;

  const cookieStore = await cookies();
  const hasToken = cookieStore.has(ACCESS_TOKEN_KEY) || cookieStore.has(REFRESH_TOKEN_KEY);
  if (hasToken && !terms && !intent && !code && !expired) {
    const safeRedirect =
      resolvedRedirect && resolvedRedirect.startsWith('/') && !resolvedRedirect.startsWith('//')
        ? resolvedRedirect
        : '/hub';
    nextRedirect(safeRedirect);
  }

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
