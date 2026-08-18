'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';

import {
  AdminCalendarIcon,
  AdminForumIcon,
  AdminDuesIcon,
  AdminSettingIcon,
  AdminPaintIcon,
  AdminPenaltyIcon,
  AdminScreenIcon,
} from '@/assets/icons/admin';
import { PeopleIcon, ExitIcon, ArrowRightIcon, LogoutIcon } from '@/assets/icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  Avatar,
  AvatarFallback,
  AvatarImage,
  ClubAvatar,
  Icon,
  SheetClose,
  SheetContent,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import { useAdminClubQuery } from '@/hooks/queries/admin/useAdminClubQuery';
import { useUserName, useUserProfileImageUrl } from '@/stores';
import { useThemeStore } from '@/stores/theme-store';
import { AppearanceView } from './AdminMobileNavSheetAppearanceView';

type AdminMobileNavSheetView = 'main' | 'appearance';

interface SheetNavItemProps {
  icon: typeof PeopleIcon;
  label: string;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  closeSheet?: boolean;
}

function SheetNavItem({
  icon,
  label,
  href,
  onClick,
  isActive,
  closeSheet = true,
}: SheetNavItemProps) {
  const baseClass = cn(
    'typo-sub1 text-text-normal flex w-full items-center justify-between rounded-md px-400 py-[14px] transition-colors',
    isActive ? 'bg-container-neutral-alternative' : 'hover:bg-background',
  );

  const inner = (
    <>
      <div className="flex items-center gap-300">
        <Icon src={icon} size={24} className="text-icon-normal" aria-hidden />
        {label}
      </div>
      <Icon src={ArrowRightIcon} size={12} className="text-icon-normal" aria-hidden />
    </>
  );

  const element = href ? (
    <Link href={href} className={baseClass} aria-current={isActive ? 'page' : undefined}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={cn(baseClass, 'cursor-pointer')}>
      {inner}
    </button>
  );

  return closeSheet ? <SheetClose asChild>{element}</SheetClose> : element;
}

function AdminMobileNavSheet() {
  const pathname = usePathname();
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();
  const { data: club } = useAdminClubQuery();
  const userName = useUserName();
  const profileImageUrl = useUserProfileImageUrl();
  const [view, setView] = useState<AdminMobileNavSheetView>('main');
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  const managementNavItems = [
    { id: 'member', icon: PeopleIcon, label: '멤버 관리', path: `/${clubId}/admin/member` },
    {
      id: 'schedule',
      icon: AdminCalendarIcon,
      label: '일정 관리',
      path: `/${clubId}/admin/schedule`,
    },
    {
      id: 'attendance',
      icon: AdminScreenIcon,
      label: '출석 관리',
      path: `/${clubId}/admin/attendance`,
    },
    { id: 'board', icon: AdminForumIcon, label: '게시판 관리', path: `/${clubId}/admin/board` },
    { id: 'dues', icon: AdminDuesIcon, label: '회비 관리', path: `/${clubId}/admin/dues` },
    {
      id: 'penalty',
      icon: AdminPenaltyIcon,
      label: '페널티 관리',
      path: `/${clubId}/admin/penalty`,
    },
  ];

  return (
    <>
      <SheetContent
        side="left"
        className={cn(
          'tablet:hidden w-full overflow-y-auto',
          view === 'appearance'
            ? 'bg-background top-0 h-dvh pt-0'
            : 'bg-container-neutral top-[61px] h-[calc(100dvh-61px)] pt-300',
        )}
        overlayClassName={cn('tablet:hidden', view === 'appearance' ? 'top-0' : 'top-[61px]')}
        onCloseAutoFocus={() => setView('main')}
      >
        {view === 'main' ? (
          <>
            {/* 클럽 정보 */}
            <div className="flex items-center gap-[10px] px-600 pt-400 pb-[28px]">
              <ClubAvatar
                src={club?.profileImageUrl ?? null}
                name={club?.name ?? ''}
                size={50}
                className="rounded-[15px] border-0"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-100">
                <span className="typo-caption2 text-text-alternative truncate">
                  {club?.schoolName}
                </span>
                <span className="typo-sub1 text-text-normal truncate">{club?.name}</span>
              </div>
            </div>

            {/* 유저 프로필 */}
            <div className="border-line border-t px-400 py-400">
              <div className="bg-background flex items-center gap-300 rounded-md p-400">
                <Avatar size={40} type="round" colorScheme="line">
                  <AvatarImage
                    key={profileImageUrl ?? 'fallback'}
                    src={profileImageUrl ?? undefined}
                    alt={userName ?? ''}
                    className="object-cover"
                  />
                  <AvatarFallback />
                </Avatar>
                <span className="typo-sub1 text-text-normal truncate">{userName}</span>
              </div>
            </div>

            {/* 관리 메뉴 */}
            <nav
              className="border-line flex flex-col gap-200 border-y px-400 py-400"
              aria-label="관리 메뉴"
            >
              {managementNavItems.map(({ id, icon, label, path }) => (
                <SheetNavItem
                  key={id}
                  icon={icon}
                  label={label}
                  href={path}
                  isActive={pathname.startsWith(path)}
                />
              ))}
            </nav>

            {/* 동아리 정보 */}
            <div className="border-line border-b px-400 py-300">
              <SheetNavItem
                icon={AdminSettingIcon}
                label="동아리 정보"
                href={`/${clubId}/admin/club-info`}
                isActive={pathname.startsWith(`/${clubId}/admin/club-info`)}
              />
            </div>

            {/* Weeth로 이동 */}
            <div className="border-line border-b px-400 py-300">
              <SheetNavItem
                icon={ExitIcon}
                label="Weeth로 이동"
                onClick={() => setServiceDialogOpen(true)}
              />
            </div>

            {/* 화면 모드 */}
            <div className="border-line border-b px-400 py-300">
              <SheetNavItem
                icon={AdminPaintIcon}
                label="화면 모드"
                onClick={() => setView('appearance')}
                closeSheet={false}
              />
            </div>

            {/* 로그아웃 */}
            <div className="px-400 py-300">
              <SheetClose asChild>
                <button
                  type="button"
                  onClick={() => setLogoutDialogOpen(true)}
                  className="typo-sub1 text-text-normal hover:bg-background flex w-full cursor-pointer items-center gap-300 rounded-md px-400 py-300 transition-colors"
                >
                  <Icon src={LogoutIcon} size={24} className="text-icon-normal" aria-hidden />
                  로그아웃
                </button>
              </SheetClose>
            </div>
          </>
        ) : (
          <AppearanceView mode={mode} onModeChange={setMode} onBack={() => setView('main')} />
        )}
      </SheetContent>

      <AlertDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        status="danger"
        title="로그아웃 하시겠어요?"
        description={'로그아웃 하시면 다시\n로그인해야 합니다.'}
      >
        <AlertDialogAction>로그아웃</AlertDialogAction>
        <AlertDialogCancel>취소</AlertDialogCancel>
      </AlertDialog>

      <AlertDialog
        open={serviceDialogOpen}
        onOpenChange={setServiceDialogOpen}
        title="서비스로 이동하시겠습니까?"
        description={'관리자 페이지에서 나가\n서비스 화면으로 이동합니다.'}
      >
        <AlertDialogAction
          onClick={() => router.push(`/${clubId}/home`)}
          className="text-text-inverse"
        >
          이동
        </AlertDialogAction>
        <AlertDialogCancel>취소</AlertDialogCancel>
      </AlertDialog>
    </>
  );
}

export { AdminMobileNavSheet };
