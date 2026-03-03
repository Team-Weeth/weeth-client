import Header from '@/components/layout/Header';

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen flex-col">
      <Header isMain={false} />
      {children}
    </div>
  );
}
