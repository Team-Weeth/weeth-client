export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="mx-auto flex min-h-screen max-w-screen flex-col">
        <main className="flex-1">{children}</main>
      </div>
    </>
  );
}
