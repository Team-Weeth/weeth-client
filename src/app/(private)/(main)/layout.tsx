import Header from '@/components/layout/Header';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex h-screen max-w-[1032px] flex-col">
      <Header />
      {children}
    </div>
  );
}
