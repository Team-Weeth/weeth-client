import type { ReactNode } from 'react';

export default function HomeLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <div className="mx-auto flex h-screen max-w-[1440px] flex-col">{children}</div>;
}
