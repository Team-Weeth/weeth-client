import type { ReactNode } from 'react';

import { Header } from '@/components/admin/layout/Header';
import { LNB } from '@/components/admin/layout/LNB';
import { AdminScopeProvider } from '@/providers';

export default function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <AdminScopeProvider>
      <div data-admin className="flex h-screen flex-col">
        <div className="flex flex-1 overflow-hidden">
          <LNB />
          <main className="bg-background flex-1 overflow-x-hidden overflow-y-auto [scrollbar-gutter:stable]">
            <Header />
            {children}
          </main>
        </div>
      </div>
    </AdminScopeProvider>
  );
}
