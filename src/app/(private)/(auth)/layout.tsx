import { cookies } from 'next/headers';

import { AuthStoreInitializer } from '@/components/auth';

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
