'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AdminForumIcon,
  AdminCalendarIcon,
  AdminSettingIcon,
  AdminFileoutIcon,
} from '@/assets/icons/admin';
import { CheckRoundIcon, ExitIcon, NavToggleIcon, PeopleIcon } from '@/assets/icons';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Icon,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import { ThemeModeSelector } from '@/components/admin/layout/ThemeModeSelector';
import { useAdminClubQuery } from '@/hooks/queries/admin/useAdminClubQuery';

const managementNavItems = [
  { id: 'member', icon: PeopleIcon, label: '멤버 관리', path: '/admin/member' },
  { id: 'schedule', icon: AdminCalendarIcon, label: '일정 관리', path: '/admin/schedule' },
  { id: 'attendance', icon: CheckRoundIcon, label: '출석 관리', path: '/admin/attendance' },
  { id: 'board', icon: AdminForumIcon, label: '게시판 관리', path: '/admin/board' },
];

const infoNavItems = [
  { id: 'club-info', icon: AdminSettingIcon, label: '동아리 정보', path: '/admin/club-info' },
];

const moveNavItems = [
  { id: 'service', icon: ExitIcon, label: 'Weeth로 이동', path: 'https://weeth.kr' },
  {
    id: 'manual',
    icon: AdminFileoutIcon,
    label: '관리자 매뉴얼',
    path: 'https://weeth-develop-2.s3.ap-northeast-2.amazonaws.com/Weeth_%E1%84%80%E1%85%AA%E1%86%AB%E1%84%85%E1%85%B5%E1%84%8C%E1%85%A1_%E1%84%86%E1%85%A6%E1%84%82%E1%85%B2%E1%84%8B%E1%85%A5%E1%86%AF_v3.pdf',
  },
];

interface NavSectionProps {
  label?: string;
  collapsed?: boolean;
  children: React.ReactNode;
}

function NavSection({ label, collapsed, children }: NavSectionProps) {
  return (
    <div className="flex flex-col">
      {label && !collapsed && (
        <span className="typo-caption1 text-text-alternative px-400 pt-500 pb-300">{label}</span>
      )}
      {children}
    </div>
  );
}

interface InternalNavItemProps {
  icon: typeof PeopleIcon;
  label: string;
  path: string;
  isActive: boolean;
  collapsed?: boolean;
}

function InternalNavItem({ icon, label, path, isActive, collapsed }: InternalNavItemProps) {
  const content = (
    <Link
      href={path}
      className={cn(
        'hover:bg-container-neutral-interaction flex h-12 items-center transition-colors',
        collapsed ? 'justify-center px-200' : 'gap-300 px-300',
        isActive ? 'bg-container-neutral-interaction text-text-strong' : 'text-text-alternative',
      )}
    >
      <Icon
        src={icon}
        size={24}
        className={cn('shrink-0', isActive ? 'text-brand-primary' : 'text-icon-alternative')}
      />
      {!collapsed && <span className="typo-sub1">{label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

interface ExternalNavItemProps {
  icon: typeof PeopleIcon;
  label: string;
  path: string;
  openInWindow?: boolean;
  collapsed?: boolean;
}

function ExternalNavItem({ icon, label, path, openInWindow, collapsed }: ExternalNavItemProps) {
  const iconEl = <Icon src={icon} size={24} className="text-icon-alternative shrink-0" />;

  const cls = cn(
    'flex h-12 items-center transition-colors text-text-alternative hover:bg-container-neutral-interaction',
    collapsed ? 'justify-center px-200' : 'gap-300 px-300',
  );

  let el: React.ReactNode;

  if (openInWindow) {
    el = (
      <button
        className={cn(cls, 'w-full cursor-pointer')}
        onClick={() => window.open(path, '_blank', 'noopener,noreferrer')}
      >
        {iconEl}
        {!collapsed && <span className="typo-sub1">{label}</span>}
      </button>
    );
  } else {
    el = (
      <Link href={path} className={cls} target="_blank" rel="noopener noreferrer">
        {iconEl}
        {!collapsed && <span className="typo-sub1">{label}</span>}
      </Link>
    );
  }

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{el}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return el;
}

function LNB() {
  const pathname = usePathname();
  const { data: club } = useAdminClubQuery();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TooltipProvider>
      <nav
        className={cn(
          'border-line bg-background flex h-full shrink-0 flex-col border-r transition-[width] duration-200',
          collapsed ? 'w-14' : 'w-56',
        )}
      >
        {/* 헤더 */}
        <div
          className={cn('flex h-12 items-center', collapsed ? 'justify-center' : 'gap-100 px-300')}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="flex shrink-0 cursor-pointer items-center justify-center"
                onClick={() => setCollapsed((prev) => !prev)}
              >
                <Icon src={NavToggleIcon} size={36} className="text-icon-alternative" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {collapsed ? '사이드바 열기' : '사이드바 닫기'}
            </TooltipContent>
          </Tooltip>
          {!collapsed && <span className="typo-sub2 text-icon-alternative">Weeth admin</span>}
        </div>

        {/* 동아리 정보 */}
        <div
          className={cn(
            'border-line bg-container-neutral flex h-30 items-start border-b py-400',
            collapsed ? 'justify-center' : 'flex-col gap-300 px-400',
          )}
        >
          <Avatar size={40} type="square" color="secondary">
            {club?.profileImageUrl && <AvatarImage src={club.profileImageUrl} alt={club.name} />}
            <AvatarFallback>{club?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex flex-col gap-100">
              <span className="typo-caption2 text-text-alternative">{club?.schoolName}</span>
              <span className="typo-sub1 text-text-strong">{club?.name}</span>
            </div>
          )}
        </div>

        {/* 관리 메뉴 */}
        <NavSection label="관리 메뉴" collapsed={collapsed}>
          {managementNavItems.map(({ id, icon, label, path }) => (
            <InternalNavItem
              key={id}
              icon={icon}
              label={label}
              path={path}
              isActive={pathname.startsWith(path)}
              collapsed={collapsed}
            />
          ))}
        </NavSection>

        {collapsed && <div className="border-icon-alternative my-200 w-6 self-center border-b" />}

        {/* 동아리 정보 메뉴 */}
        <NavSection collapsed={collapsed}>
          {infoNavItems.map(({ id, icon, label, path }) => (
            <InternalNavItem
              key={id}
              icon={icon}
              label={label}
              path={path}
              isActive={pathname.startsWith(path)}
              collapsed={collapsed}
            />
          ))}
        </NavSection>

        {collapsed && <div className="border-icon-alternative my-200 w-6 self-center border-b" />}

        {/* 이동 */}
        <NavSection label="이동" collapsed={collapsed}>
          {moveNavItems.map(({ id, icon, label, path }) => (
            <ExternalNavItem
              key={id}
              icon={icon}
              label={label}
              path={path}
              openInWindow={id === 'manual'}
              collapsed={collapsed}
            />
          ))}

          {collapsed && <div className="border-icon-alternative my-200 w-6 self-center border-b" />}

          {/* 라이트 모드 */}
          <ThemeModeSelector collapsed={collapsed} />
        </NavSection>
      </nav>
    </TooltipProvider>
  );
}

export { LNB };
