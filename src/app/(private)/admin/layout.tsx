import { Header } from '@/components/admin/layout/Header';
import { LNB } from '@/components/admin/layout/LNB';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div data-admin className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        <LNB />
        <main className="bg-background flex-1 overflow-auto">
          <Header />
          {children}
        </main>
      </div>
    </div>
  );
}
