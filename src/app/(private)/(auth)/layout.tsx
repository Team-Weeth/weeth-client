import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import { AuthStoreInitializer } from '@/components/auth/AuthStoreInitializer';

export const metadata: Metadata = { robots: { index: false } };

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const userName = cookieStore.get('userName')?.value ?? null;

  return (
    <>
      <AuthStoreInitializer name={userName} />
      {children}
    </>
  );
}
