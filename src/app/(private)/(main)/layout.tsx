import type { ReactNode } from 'react';

import { ClubGuard, Header } from '@/components/layout';

export default function MainLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <ClubGuard>
      <div className="mx-auto flex h-screen max-w-[1440px] flex-col">
        <Header />
        {children}
      </div>
    </ClubGuard>
  );
}
