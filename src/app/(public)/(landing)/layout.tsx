import type { ReactNode } from 'react';

import { Footer, Header } from '@/components/layout';

export default function LandingLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col">
        <Header isMain={false} />
        <main className="flex-1">{children}</main>
      </div>
      <Footer />
    </>
  );
}
