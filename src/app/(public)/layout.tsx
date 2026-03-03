import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="mx-auto flex h-screen max-w-[1032px] flex-col">
        <Header isMain={false} />
        {children}
      </div>
      <Footer />
    </>
  );
}
