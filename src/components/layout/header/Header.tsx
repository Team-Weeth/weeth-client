'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { LogoGrayIcon, ExitToAppIcon } from '@/assets/icons';
import { cn } from '@/lib/cn';
import { useClubName, useUserProfileImageUrl } from '@/stores';
import { PostingActions } from './PostingActions';
import { DefaultActions } from './DefaultActions';
import { MobileNavSheet } from './MobileNavSheet';
import { MobileWriteButton } from './MobileWriteButton';
import { Avatar, AvatarFallback, AvatarImage, Icon } from '@/components/ui';
import { useIsAdmin } from '@/hooks/shared';

interface HeaderProps {
  isMain?: boolean;
}

const Logo = ({ width = 32, href }: { width?: number; href: string }) => (
  <Link href={href} aria-label="홈으로 이동" className="inline-flex">
    <Image src={LogoGrayIcon} alt="logo" width={width} height={32} className="cursor-pointer" />
  </Link>
);

export default function Header({ isMain = true }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { clubId } = useParams<{ clubId: string }>();
  const clubName = useClubName();
  const profileImageUrl = useUserProfileImageUrl();
  const { isAdmin } = useIsAdmin();
  const isPostingPage = pathname.includes('/write') || /\/board\/edit\/\d+$/.test(pathname);

  const NAV_ITEMS = [
    { id: 'board', label: '게시판', href: `/${clubId}/board` },
    { id: 'attendance', label: '출석', href: `/${clubId}/attendance` },
  ];
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const shouldShow = currentY < 10 || currentY < lastScrollY.current;

      lastScrollY.current = currentY;

      setVisible((prev) => {
        if (prev === shouldShow) return prev;
        return shouldShow;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={cn(
        'bg-background sticky top-0 z-[70] w-full transition-transform duration-300 ease-in-out',
        visible ? 'translate-y-0' : '-translate-y-full',
      )}
    >
      <header className="tablet:hidden bg-background flex items-center justify-between gap-100 py-3 pr-450 pl-200">
        {isMain && (
          <div className="flex items-center justify-center gap-100">
            <MobileNavSheet />
            <span className="typo-sub1 text-text-normal px-1">{clubName}</span>
          </div>
        )}
        {isMain && clubId && (
          <div className="flex items-center justify-center gap-200">
            {isPostingPage ? (
              <PostingActions />
            ) : (
              <>
                <MobileWriteButton />
                {isAdmin && (
                  <button
                    type="button"
                    aria-label="운영진 페이지로 이동"
                    onClick={() => router.push(`/${clubId}/admin`)}
                    className="flex cursor-pointer items-center justify-center rounded-full"
                  >
                    <Icon
                      src={ExitToAppIcon}
                      alt="avatar"
                      size={40}
                      className="text-icon-normal p-2"
                    />
                  </button>
                )}
                <button
                  type="button"
                  aria-label="마이페이지로 이동"
                  onClick={() => router.push(`/${clubId}/mypage`)}
                  className="cursor-pointer rounded-full"
                >
                  <Avatar size={40} type="round">
                    <AvatarImage
                      key={profileImageUrl ?? 'fallback'}
                      src={profileImageUrl ?? undefined}
                      alt="avatar"
                      className="object-cover"
                    />
                    <AvatarFallback />
                  </Avatar>
                </button>
              </>
            )}
          </div>
        )}
      </header>
      <header className="tablet:flex bg-background hidden w-full items-center justify-between px-5 py-3">
        <div className="flex items-center gap-4">
          <Logo href={isMain ? `/${clubId}/home` : '/'} />

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
          <span className="typo-sub2 absolute left-1/2 -translate-x-1/2 text-neutral-700">
            {clubName}
          </span>
        )}
        {isMain && (isPostingPage ? <PostingActions /> : <DefaultActions />)}
      </header>
    </div>
  );
}
