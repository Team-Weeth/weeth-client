'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ExitIcon,
  PersonIcon,
  CheckRoundIcon,
  PinIcon,
  LogoutIcon,
  HomeIcon,
  MenuIcon,
} from '@/assets/icons';
import { Icon, Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui';
import { logoutAction } from '@/lib/actions/auth';
import { cn } from '@/lib/cn';
import { useIsAdmin } from '@/hooks/shared';

const NAV_ITEMS = [
  { id: 'home', label: 'HOME', href: '/home', icon: HomeIcon },
  { id: 'board', label: '게시판', href: '/board', icon: PinIcon },
  { id: 'attendance', label: '출석', href: '/attendance', icon: CheckRoundIcon },
  { id: 'admin', label: '관리자 서비스', href: '/admin', icon: ExitIcon },
  { id: 'mypage', label: 'MY', href: '/mypage', icon: PersonIcon },
] as const;

function MobileNavSheet() {
  const pathname = usePathname();
  const { isAdmin } = useIsAdmin();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="메뉴 열기"
          className="flex cursor-pointer items-center justify-center rounded-sm outline-none"
        >
          <Icon src={MenuIcon} alt="menu" size={40} className="text-icon-normal p-2" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="tablet:max-w-[375px] bg-container-neutral top-[64px] h-[calc(100dvh-64px)] w-full max-w-[440px]"
      >
        <nav className="flex flex-1 flex-col gap-200 px-450 py-400" aria-label="주요 메뉴">
          {NAV_ITEMS.filter(({ id }) => id !== 'admin' || isAdmin).map(
            ({ id, label, href, icon }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Fragment key={id}>
                  {id === 'admin' && <div className="bg-line h-px" />}
                  <SheetClose asChild>
                    <Link
                      href={href}
                      className={cn(
                        'typo-button1 flex items-center gap-300 rounded-md p-200 px-450 transition-colors',
                        isActive
                          ? 'bg-brand-primary text-text-inverse'
                          : 'text-text-normal hover:bg-container-neutral-interaction',
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon
                        src={icon}
                        size={24}
                        className={isActive ? 'text-text-inverse' : 'text-icon-normal'}
                      />
                      {label}
                    </Link>
                  </SheetClose>
                </Fragment>
              );
            },
          )}
        </nav>

        <form action={logoutAction} className="pb-[24px] pl-[18px]">
          <button
            type="submit"
            className="typo-button1 text-text-alternative flex w-full cursor-pointer items-center gap-100 py-300"
          >
            <Icon src={LogoutIcon} size={20} className="text-icon-alternative" />
            로그아웃
          </button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export { MobileNavSheet };
