import { Header } from '@/components/admin/layout/Header';
import { LNB } from '@/components/admin/layout/LNB';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div data-admin className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <LNB />
        <main className="flex-1 overflow-auto bg-container-neutral-alternative">
          {children}
        </main>
      </div>
    </div>
  );
}
