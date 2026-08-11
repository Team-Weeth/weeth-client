'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import ExitIcon from '@/assets/icons/exit.svg';
import PersonIcon from '@/assets/icons/person.svg';
import CheckRoundIcon from '@/assets/icons/check_round.svg';
import PinIcon from '@/assets/icons/pin.svg';
import LogoutIcon from '@/assets/icons/logout.svg';
import HomeIcon from '@/assets/icons/home.svg';
import MenuIcon from '@/assets/icons/menu.svg';
import AdminDuesIcon from '@/assets/icons/admin/ic_admin_dues.svg';
import { Divider } from '@/components/ui/Divider';
import { Icon } from '@/components/ui/Icon';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/Sheet';
import { cn } from '@/lib/cn';
import { useBoardList } from '@/hooks/board/useBoardQuery';
import { useLogout } from '@/hooks/useLogout';
import { useDuesVisibility } from '@/hooks/queries';
import { useIsAdmin } from '@/hooks/shared';
import { useActiveBoardId } from '@/stores/useBoardNavStore';

function MobileNavSheet() {
  const pathname = usePathname();
  const { clubId } = useParams<{ clubId: string }>();
  const { isAdmin } = useIsAdmin();
  const handleLogout = useLogout();
  const { data: rawBoards } = useBoardList();
  const { data: duesVisibility } = useDuesVisibility();
  const activeBoardId = useActiveBoardId();
  const isDuesVisible = duesVisibility?.visible === true;

  const isPostingPage = pathname.includes('/write') || /\/board\/edit\/\d+$/.test(pathname);
  const isBoardPage = pathname.startsWith(`/${clubId}/board`) && !isPostingPage;

  const boards = rawBoards
    ? rawBoards.some((b) => b.type === 'ALL')
      ? rawBoards
      : [{ id: null as null, name: '전체', type: 'ALL' as const }, ...rawBoards]
    : undefined;

  const navItems = [
    { id: 'home', label: 'HOME', href: `/${clubId}/home`, icon: HomeIcon },
    { id: 'board', label: '게시판', href: `/${clubId}/board`, icon: PinIcon },
    { id: 'attendance', label: '출석', href: `/${clubId}/attendance`, icon: CheckRoundIcon },
    ...(isDuesVisible
      ? [{ id: 'dues', label: '회비', href: `/${clubId}/dues`, icon: AdminDuesIcon }]
      : []),
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
                  {id === 'board' && isBoardPage && boards && (
                    <div className="flex flex-col gap-200 pl-[32px]">
                      {boards.map((board, index) => {
                        const prevBoard = boards[index - 1];
                        const showDivider =
                          !!prevBoard && prevBoard.type !== 'GENERAL' && board.type === 'GENERAL';
                        const isActiveBoard = board.id === activeBoardId;
                        const boardHref =
                          board.id === null ? `/${clubId}/board` : `/${clubId}/board/${board.id}`;

                        return (
                          <Fragment key={board.id ?? 'all'}>
                            {showDivider && <Divider className="my-100" />}
                            <SheetClose asChild>
                              <Link
                                href={boardHref}
                                className={cn(
                                  'typo-button1 rounded-md px-400 py-200 transition-colors',
                                  isActiveBoard
                                    ? 'text-brand-primary'
                                    : 'text-text-normal hover:bg-container-neutral-interaction',
                                )}
                                aria-current={isActiveBoard ? 'page' : undefined}
                              >
                                {board.name}
                              </Link>
                            </SheetClose>
                          </Fragment>
                        );
                      })}
                    </div>
                  )}
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
