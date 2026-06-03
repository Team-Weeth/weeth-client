import type { ReactNode } from 'react';

export default function BoardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <>{children}</>;
}
