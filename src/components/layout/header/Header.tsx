'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { MenuIcon, LogoIcon } from '@/assets/icons';

import { PostingActions } from './PostingActions';
import { DefaultActions } from './DefaultActions';

interface HeaderProps {
  isMain?: boolean;
}

const Logo = ({ width = 76, href }: { width?: number; href: string }) => (
  <Link href={href} aria-label="홈으로 이동" className="inline-flex">
    <Image
      src={LogoIcon}
      alt="logo"
      width={width}
      height={40}
      className="mt-[2px] mr-1 mb-[6px] cursor-pointer"
    />
  </Link>
);

const NAV_ITEMS = [
  { id: 'board', label: '게시판', href: '/board' },
  { id: 'attendance', label: '출석', href: '/attendance' },
];

export default function Header({ isMain = true }: HeaderProps) {
  const pathname = usePathname();
  const isPostingPage = pathname.includes('/write') || /^\/board\/edit\/\d+$/.test(pathname);

  return (
    <>
      <header className="tablet:hidden flex gap-100 py-3 pr-450 pl-200">
        {isMain && (
          <Image src={MenuIcon} alt="menu" width={40} height={40} className="cursor-pointer p-2" />
        )}
        <Logo width={90} href={isMain ? '/home' : '/'} />
      </header>
      <header className="tablet:flex flex hidden w-full items-center justify-between px-5 py-3">
        <div className="flex items-center gap-300">
          <Logo href={isMain ? '/home' : '/'} />

          {!isMain && (
            <>
              {/* TODO: 추후  href 수정 필요 */}
              <Link
                href="#"
                className="typo-button1 text-text-alternative hover:text-text-normal transition-colors"
              >
                서비스소개
              </Link>
              <Link
                href="#"
                className="typo-button1 text-text-alternative hover:text-text-normal transition-colors"
              >
                가입문의
              </Link>
            </>
          )}
          {isMain &&
            NAV_ITEMS.map(({ id, label, href }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={id}
                  href={href}
                  className={`typo-button1 py-200 transition-colors ${
                    isActive
                      ? 'text-brand-primary'
                      : 'text-text-alternative hover:text-brand-primary'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
        </div>
        {isMain && (isPostingPage ? <PostingActions /> : <DefaultActions />)}
      </header>
    </>
  );
}
