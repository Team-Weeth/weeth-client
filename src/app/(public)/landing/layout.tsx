import type { ReactNode } from 'react';

export default function PublicLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="mx-auto flex min-h-screen max-w-screen flex-col">
      <main className="flex-1">{children}</main>
    </div>
  );
}
