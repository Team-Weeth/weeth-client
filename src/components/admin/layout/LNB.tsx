'use client';

import { useEffect, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import {
  AdminForumIcon,
  AdminCalendarIcon,
  AdminSettingIcon,
  AdminDuesIcon,
} from '@/assets/icons/admin';
import { CheckRoundIcon, ExitIcon, PeopleIcon } from '@/assets/icons';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  TooltipProvider,
} from '@/components/ui';
import { useMediaQuery } from '@/hooks';
import { cn } from '@/lib/cn';
import { CollapsedDivider } from '@/components/admin/layout/CollapsedDivider';
import { LNBClubInfo } from '@/components/admin/layout/LNBClubInfo';
import { LNBProfile } from '@/components/admin/layout/LNBProfile';
import { NavSection } from '@/components/admin/layout/NavSection';
import { NavItem } from '@/components/admin/layout/NavItem';
import { useAdminLNBActions, useAdminLNBCollapsed } from '@/stores/useAdminLNBStore';

function LNB() {
  const pathname = usePathname();
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();
  const isBelowTablet = useMediaQuery('(max-width: 695.98px)');
  const collapsed = useAdminLNBCollapsed();
  const { setCollapsed } = useAdminLNBActions();
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);

  // 브레이크포인트를 넘나들 때 기본 접힘 상태를 동기화
  useEffect(() => {
    setCollapsed(isBelowTablet);
  }, [isBelowTablet, setCollapsed]);

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
    { id: 'dues', icon: AdminDuesIcon, label: '회비 관리', path: `/${clubId}/admin/dues` },
  ];

  const infoNavItems = [
    {
      id: 'club-info',
      icon: AdminSettingIcon,
      label: '동아리 정보',
      path: `/${clubId}/admin/club-info`,
    },
  ];

  return (
    <TooltipProvider>
      <nav
        className={cn(
          'bg-background flex h-full shrink-0 flex-col transition-[width] duration-200 overflow-x-hidden',
          collapsed ? 'w-22' : 'w-60',
        )}
      >
        <div className={cn('flex self-stretch items-start pt-300 pb-100', !collapsed && 'px-400')}>
          <LNBClubInfo collapsed={collapsed} />
        </div>

        {collapsed ? (
          <div className="border-line flex flex-col border-t border-b">
            <NavSection collapsed={collapsed}>
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
          </div>
        ) : (
          <>
            <CollapsedDivider collapsed={collapsed} />
            <NavSection collapsed={collapsed}>
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
          </>
        )}

        {collapsed ? (
          <div className="border-line flex flex-col items-center justify-center gap-100 self-stretch border-b p-400">
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
          </div>
        ) : (
          <>
            <CollapsedDivider collapsed={collapsed} />
            <NavSection collapsed={collapsed}>
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
          </>
        )}

        {collapsed ? (
          <div className="border-line flex flex-col items-center justify-center gap-100 self-stretch border-b p-400">
            <NavItem
              icon={ExitIcon}
              label="Weeth로 이동"
              path={servicePath}
              collapsed={collapsed}
              onClick={() => setServiceDialogOpen(true)}
            />
          </div>
        ) : (
          <>
            <CollapsedDivider collapsed={collapsed} />
            <NavSection collapsed={collapsed}>
              <NavItem
                icon={ExitIcon}
                label="Weeth로 이동"
                path={servicePath}
                collapsed={collapsed}
                onClick={() => setServiceDialogOpen(true)}
              />
            </NavSection>
          </>
        )}

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

        <div
          className={cn(
            'flex grow shrink-0 flex-col items-start justify-end gap-200 self-stretch',
            collapsed ? 'px-200 py-400' : 'py-400 px-450',
          )}
        >
          <LNBProfile collapsed={collapsed} />
        </div>
      </nav>
    </TooltipProvider>
  );
}

export { LNB };
