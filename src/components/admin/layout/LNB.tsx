'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AdminForumIcon,
  AdminCalendarIcon,
  AdminSettingIcon,
  AdminFileoutIcon,
} from '@/assets/icons/admin';
import { CheckRoundIcon, ExitIcon, NavToggleIcon, PeopleIcon } from '@/assets/icons';

import { Avatar, Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import { ThemeModeSelector } from '@/components/admin/layout/ThemeModeSelector';

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

const navItemClass =
  'typo-sub1 flex h-12 items-center gap-300 px-300 transition-colors text-text-alternative hover:bg-container-neutral-interaction';

interface NavSectionProps {
  label?: string;
  children: React.ReactNode;
}

function NavSection({ label, children }: NavSectionProps) {
  return (
    <div className="flex flex-col">
      {label && (
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
}

function InternalNavItem({ icon, label, path, isActive }: InternalNavItemProps) {
  return (
    <Link
      href={path}
      className={cn(navItemClass, isActive && 'bg-container-neutral-interaction text-text-strong')}
    >
      <Icon
        src={icon}
        size={24}
        className={isActive ? 'text-brand-primary' : 'text-icon-alternative'}
      />
      {label}
    </Link>
  );
}

interface ExternalNavItemProps {
  icon: typeof PeopleIcon;
  label: string;
  path: string;
  openInWindow?: boolean;
}

function ExternalNavItem({ icon, label, path, openInWindow }: ExternalNavItemProps) {
  if (openInWindow) {
    return (
      <button
        className={cn(navItemClass, 'w-full cursor-pointer')}
        onClick={() => window.open(path, '_blank', 'noopener,noreferrer')}
      >
        <Icon src={icon} size={24} className="text-icon-alternative" />
        {label}
      </button>
    );
  }

  return (
    <Link href={path} className={navItemClass} target="_blank" rel="noopener noreferrer">
      <Icon src={icon} size={24} className="text-icon-alternative" />
      {label}
    </Link>
  );
}

function LNB() {
  const pathname = usePathname();

  return (
    <nav className="border-line bg-background flex h-full w-60 shrink-0 flex-col border-r">
      {/* 헤더 */}
      <div className="flex items-center gap-300 px-300 py-400">
        <Icon src={NavToggleIcon} size={40} className="text-icon-alternative" />
        <span className="typo-sub2 text-text-normal">Weeth admin</span>
      </div>

      {/* 동아리 정보 */}
      <div className="flex flex-col gap-100 px-400 pb-400">
        <Avatar></Avatar>
        <span className="typo-sub2 text-text-strong">가천대 검도부</span>
      </div>

      {/* 관리 메뉴 */}
      <NavSection label="관리 메뉴">
        {managementNavItems.map(({ id, icon, label, path }) => (
          <InternalNavItem
            key={id}
            icon={icon}
            label={label}
            path={path}
            isActive={pathname.startsWith(path)}
          />
        ))}
      </NavSection>

      {/* 동아리 정보 메뉴 */}
      <NavSection>
        {infoNavItems.map(({ id, icon, label, path }) => (
          <InternalNavItem
            key={id}
            icon={icon}
            label={label}
            path={path}
            isActive={pathname.startsWith(path)}
          />
        ))}
      </NavSection>

      {/* 이동 */}
      <NavSection label="이동">
        {moveNavItems.map(({ id, icon, label, path }) => (
          <ExternalNavItem
            key={id}
            icon={icon}
            label={label}
            path={path}
            openInWindow={id === 'manual'}
          />
        ))}
        <ThemeModeSelector />
      </NavSection>
    </nav>
  );
}

export { LNB };
