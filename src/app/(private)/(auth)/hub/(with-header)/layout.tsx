import { PublicHeader } from '@/components/layout/header/PublicHeader';

export default function ServiceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col">
      <PublicHeader />
      <main className="flex-1 pt-16">{children}</main>
    </div>
  );
}
