import { Header } from '@/components/layout';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex h-screen max-w-[1440px] flex-col">
      <Header />
      {children}
    </div>
  );
}
