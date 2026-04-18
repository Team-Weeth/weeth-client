'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { MenuIcon, LogoGrayIcon, AvatarIcon } from '@/assets/icons';
import { useClubName } from '@/stores';

import { PostingActions } from './PostingActions';
import { DefaultActions } from './DefaultActions';

interface HeaderProps {
  isMain?: boolean;
}

const Logo = ({ width = 32, href }: { width?: number; href: string }) => (
  <Link href={href} aria-label="홈으로 이동" className="inline-flex">
    <Image src={LogoGrayIcon} alt="logo" width={width} height={32} className="cursor-pointer" />
  </Link>
);

const NAV_ITEMS = [
  { id: 'board', label: '게시판', href: '/board' },
  { id: 'attendance', label: '출석', href: '/attendance' },
];

export default function Header({ isMain = true }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const clubName = useClubName();
  const isPostingPage = pathname.includes('/write') || /^\/board\/edit\/\d+$/.test(pathname);

  return (
    <>
      <header className="tablet:hidden flex items-center justify-between gap-100 py-3 pr-450 pl-200">
        {isMain && (
          <div className="flex items-center gap-100">
            <Image
              src={MenuIcon}
              alt="menu"
              width={40}
              height={40}
              className="cursor-pointer p-2"
            />
            <span className="typo-sub1 text-text-normal px-1">{clubName}</span>
          </div>
        )}
        <button
          type="button"
          aria-label="마이페이지로 이동"
          onClick={() => router.push('/mypage')}
          className="cursor-pointer rounded-full"
        >
          <Image src={AvatarIcon} alt="avatar" width={40} height={40} />
        </button>
      </header>
      <header className="tablet:flex relative flex hidden w-full items-center justify-between px-5 py-3">
        <div className="flex items-center gap-4">
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
        {isMain && (
          <span className="typo-sub1 absolute left-1/2 -translate-x-1/2 text-neutral-700">
            {clubName}
          </span>
        )}
        {isMain && (isPostingPage ? <PostingActions /> : <DefaultActions />)}
      </header>
    </>
  );
}
