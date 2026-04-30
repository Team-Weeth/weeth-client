'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
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
import { cn } from '@/lib/cn';
import { useLogout } from '@/hooks';
import { useIsAdmin } from '@/hooks/shared';

function MobileNavSheet() {
  const pathname = usePathname();
  const { clubId } = useParams<{ clubId: string }>();
  const { isAdmin } = useIsAdmin();
  const handleLogout = useLogout();

  const navItems = [
    { id: 'home', label: 'HOME', href: `/${clubId}/home`, icon: HomeIcon },
    { id: 'board', label: '게시판', href: `/${clubId}/board`, icon: PinIcon },
    { id: 'attendance', label: '출석', href: `/${clubId}/attendance`, icon: CheckRoundIcon },
    { id: 'admin', label: '운영진 서비스', href: `/${clubId}/admin`, icon: ExitIcon },
    { id: 'mypage', label: 'MY', href: `/${clubId}/mypage`, icon: PersonIcon },
  ] as const;

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
        className="tablet:max-w-93.75 bg-container-neutral top-16 h-[calc(100dvh-64px)] w-full max-w-110"
      >
        <nav className="flex flex-1 flex-col gap-200 px-450 py-400" aria-label="주요 메뉴">
          {navItems
            .filter(({ id }) => id !== 'admin' || isAdmin)
            .map(({ id, label, href, icon }) => {
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
            })}
        </nav>

        <div className="pb-600 pl-450">
          <button
            type="button"
            onClick={handleLogout}
            className="typo-button1 text-text-alternative flex w-full cursor-pointer items-center gap-100 py-300"
          >
            <Icon src={LogoutIcon} size={20} className="text-icon-alternative" />
            로그아웃
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export { MobileNavSheet };
