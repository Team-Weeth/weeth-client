import Image from 'next/image';

export function Header() {
  return (
    <header className="h-15 w-full shrink-0 flex items-center px-500 border-b border-line bg-container-neutral">
      <Image
        src="/assets/favicon/favicon.svg"
        alt="Weeth"
        width={28}
        height={28}
      />
      <span className="ml-300 typo-sub1 text-text-strong">Weeth Admin</span>
    </header>
  );
}
