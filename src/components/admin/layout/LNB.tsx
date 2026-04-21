'use client';

import { useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import {
  AdminForumIcon,
  AdminCalendarIcon,
  AdminSettingIcon,
  AdminFileoutIcon,
} from '@/assets/icons/admin';
import { CheckRoundIcon, ExitIcon, PeopleIcon } from '@/assets/icons';

import { TooltipProvider } from '@/components/ui';
import { cn } from '@/lib/cn';
import { LNBHeader } from '@/components/admin/layout/LNBHeader';
import { LNBClubInfo } from '@/components/admin/layout/LNBClubInfo';
import { NavSection } from '@/components/admin/layout/NavSection';
import { NavItem } from '@/components/admin/layout/NavItem';
import { CollapsedDivider } from '@/components/admin/layout/CollapsedDivider';
import { ThemeModeSelector } from '@/components/admin/layout/ThemeModeSelector';

function LNB() {
  const pathname = usePathname();
  const { clubId } = useParams<{ clubId: string }>();
  const [collapsed, setCollapsed] = useState(false);

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
      icon: CheckRoundIcon,
      label: '출석 관리',
      path: `/${clubId}/admin/attendance`,
    },
    { id: 'board', icon: AdminForumIcon, label: '게시판 관리', path: `/${clubId}/admin/board` },
  ];

  const infoNavItems = [
    {
      id: 'club-info',
      icon: AdminSettingIcon,
      label: '동아리 정보',
      path: `/${clubId}/admin/club-info`,
    },
  ];

  const moveNavItems = [
    {
      id: 'service',
      icon: ExitIcon,
      label: '서비스로 이동',
      path: `/${clubId}/home`,
      external: false,
    },
    {
      id: 'manual',
      icon: AdminFileoutIcon,
      label: '관리자 매뉴얼',
      path: 'https://weeth-develop-2.s3.ap-northeast-2.amazonaws.com/Weeth_%E1%84%80%E1%85%AA%E1%86%AB%E1%84%85%E1%85%B5%E1%84%8C%E1%85%A1_%E1%84%86%E1%85%A6%E1%84%82%E1%85%B2%E1%84%8B%E1%85%A5%E1%86%AF_v3.pdf',
      external: true,
      openInWindow: true,
    },
  ];

  return (
    <TooltipProvider>
      <nav
        className={cn(
          'border-line bg-background flex h-full shrink-0 flex-col border-r transition-[width] duration-200',
          collapsed ? 'w-14' : 'w-56',
        )}
      >
        <LNBHeader collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
        <LNBClubInfo collapsed={collapsed} />

        <NavSection label="관리 메뉴" collapsed={collapsed}>
          {managementNavItems.map(({ id, icon, label, path }) => (
            <NavItem
              key={id}
              icon={icon}
              label={label}
              path={path}
              isActive={pathname.startsWith(path)}
              collapsed={collapsed}
            />
          ))}
        </NavSection>

        <CollapsedDivider collapsed={collapsed} />

        <NavSection label="설정" collapsed={collapsed}>
          {infoNavItems.map(({ id, icon, label, path }) => (
            <NavItem
              key={id}
              icon={icon}
              label={label}
              path={path}
              isActive={pathname.startsWith(path)}
              collapsed={collapsed}
            />
          ))}
        </NavSection>

        <CollapsedDivider collapsed={collapsed} />

        <NavSection label="이동" collapsed={collapsed}>
          {moveNavItems.map(({ id, icon, label, path, external, openInWindow }) => (
            <NavItem
              key={id}
              icon={icon}
              label={label}
              path={path}
              collapsed={collapsed}
              external={external}
              openInWindow={openInWindow}
            />
          ))}
        </NavSection>
        <CollapsedDivider collapsed={collapsed} />
        <NavSection label="모드" collapsed={collapsed}>
          <ThemeModeSelector collapsed={collapsed} />
        </NavSection>
      </nav>
    </TooltipProvider>
  );
}

export { LNB };
