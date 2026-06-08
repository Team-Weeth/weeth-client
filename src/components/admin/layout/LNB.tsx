'use client';

import { useEffect, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { AdminForumIcon, AdminCalendarIcon, AdminSettingIcon, AdminDueIcon } from '@/assets/icons/admin';
import { CheckRoundIcon, ExitIcon, PeopleIcon } from '@/assets/icons';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  TooltipProvider,
} from '@/components/ui';
import { useMediaQuery } from '@/hooks';
import { cn } from '@/lib/cn';
import { LNBHeader } from '@/components/admin/layout/LNBHeader';
import { LNBClubInfo } from '@/components/admin/layout/LNBClubInfo';
import { NavSection } from '@/components/admin/layout/NavSection';
import { NavItem } from '@/components/admin/layout/NavItem';
import { CollapsedDivider } from '@/components/admin/layout/CollapsedDivider';
import { ThemeModeSelector } from '@/components/admin/layout/ThemeModeSelector';

function LNB() {
  const pathname = usePathname();
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();
  // tablet(696px) 미만에서는 기본적으로 접힌 상태로 시작
  const isBelowTablet = useMediaQuery('(max-width: 695.98px)');
  const [collapsed, setCollapsed] = useState(false);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);

  // 브레이크포인트를 넘나들 때 기본 접힘 상태를 동기화
  useEffect(() => {
    setCollapsed(isBelowTablet);
  }, [isBelowTablet]);

  const servicePath = `/${clubId}/home`;

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
    { id: 'dues', icon: AdminDueIcon, label: '회비 관리', path: `/${clubId}/admin/dues` },
  ];

  const infoNavItems = [
    {
      id: 'club-info',
      icon: AdminSettingIcon,
      label: '동아리 정보',
      path: `/${clubId}/admin/club-info`,
    },
  ];

  // const moveNavItems = [
  //   {
  //     id: 'manual',
  //     icon: AdminFileoutIcon,
  //     label: '운영진 매뉴얼',
  //     path: 'https://weeth-develop-2.s3.ap-northeast-2.amazonaws.com/Weeth_%E1%84%80%E1%85%AA%E1%86%AB%E1%84%85%E1%85%B5%E1%84%8C%E1%85%A1_%E1%84%86%E1%85%A6%E1%84%82%E1%85%B2%E1%84%8B%E1%85%A5%E1%86%AF_v3.pdf',
  //     external: true,
  //     openInWindow: true,
  //   },
  // ];

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
          <NavItem
            icon={ExitIcon}
            label="서비스로 이동"
            path={servicePath}
            collapsed={collapsed}
            onClick={() => setServiceDialogOpen(true)}
          />
        </NavSection>

        <AlertDialog
          open={serviceDialogOpen}
          onOpenChange={setServiceDialogOpen}
          title="서비스로 이동하시겠습니까?"
          description={'관리자 페이지에서 나가\n서비스 화면으로 이동합니다.'}
        >
          <AlertDialogAction onClick={() => router.push(servicePath)} className="text-text-inverse">
            이동
          </AlertDialogAction>
          <AlertDialogCancel>취소</AlertDialogCancel>
        </AlertDialog>
        <CollapsedDivider collapsed={collapsed} />
        <NavSection label="모드" collapsed={collapsed}>
          <ThemeModeSelector collapsed={collapsed} />
        </NavSection>
      </nav>
    </TooltipProvider>
  );
}

export { LNB };
