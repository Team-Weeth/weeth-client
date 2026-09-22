'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PeopleIcon from '@/assets/icons/people.svg';
import ArrowFillDownIcon from '@/assets/icons/arrow_fill_down.svg';
import ListIcon from '@/assets/icons/admin/ic_admin_list.svg';
import PersonIcon from '@/assets/icons/admin/ic_admin_person.svg';
import { Icon } from '@/components/ui/Icon';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import { cn } from '@/lib/cn';

interface MemberNavGroupProps {
  clubId: string;
  pathname: string;
  collapsed: boolean;
}

function MemberNavGroup({ clubId, pathname, collapsed }: MemberNavGroupProps) {
  const router = useRouter();
  const memberPath = `/${clubId}/admin/member`;
  const isMemberRoute = pathname.startsWith(memberPath);
  const [open, setOpen] = useState(isMemberRoute);
  const [wasMemberRoute, setWasMemberRoute] = useState(isMemberRoute);
  const menuId = useId();

  // LNB는 라우팅 중에도 유지되므로, 멤버 경로를 드나들 때 펼침 상태를 새로고침했을 때와 맞춘다.
  // 그 외 이동에서는 사용자가 직접 토글한 상태를 그대로 둔다.
  if (wasMemberRoute !== isMemberRoute) {
    setWasMemberRoute(isMemberRoute);
    setOpen(isMemberRoute);
  }

  // 다른 페이지에서 눌렀을 때는 펼치기만 하지 않고 멤버 목록까지 바로 이동한다.
  // 이미 멤버 경로 안이라면 평소처럼 펼침/접힘만 토글한다.
  const handleTriggerClick = () => {
    if (!isMemberRoute) {
      setOpen(true);
      router.push(memberPath);
      return;
    }
    setOpen((previous) => !previous);
  };

  const expanded = open;
  const items = [
    { label: '멤버 목록', icon: ListIcon, path: memberPath, active: pathname === memberPath },
    {
      label: '부원 정보',
      icon: PersonIcon,
      path: `${memberPath}/position-settings`,
      active: pathname.startsWith(`${memberPath}/position-settings`),
    },
  ];

  return (
    <div className="shrink-0">
      <MemberNavTooltip label="멤버 관리" enabled={collapsed && !expanded}>
        <button
          type="button"
          aria-label="멤버 관리"
          aria-expanded={expanded}
          aria-controls={menuId}
          onClick={handleTriggerClick}
          className={cn(
            'text-text-normal hover:bg-container-neutral-interaction flex w-full shrink-0 cursor-pointer items-center rounded-md',
            collapsed ? 'justify-center p-400' : 'gap-300 px-400 py-[14px]',
          )}
        >
          <Icon src={PeopleIcon} size={24} className="text-icon-alternative" />
          {!collapsed && (
            <>
              <span className="typo-sub3 whitespace-nowrap">멤버 관리</span>
              <Icon
                src={ArrowFillDownIcon}
                size={24}
                className={cn(
                  'text-icon-normal -ml-100 transition-transform duration-200 motion-reduce:transition-none',
                  !expanded && '-rotate-90',
                )}
              />
            </>
          )}
        </button>
      </MemberNavTooltip>
      <div
        id={menuId}
        aria-hidden={!expanded}
        inert={!expanded}
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-200 ease-in-out motion-reduce:transition-none',
          expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="flex flex-col gap-100">
            {items.map(({ label, icon, path, active }) => (
              <MemberNavTooltip key={path} label={label} enabled={collapsed && expanded}>
                <Link
                  href={path}
                  aria-label={label}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'typo-sub3 text-text-normal hover:bg-container-neutral-interaction flex shrink-0 items-center rounded-md',
                    collapsed ? 'justify-center p-400' : 'gap-200 py-[11px] pr-400 pl-10',
                    active && 'bg-container-neutral-interaction font-bold',
                  )}
                >
                  <Icon
                    src={icon}
                    size={collapsed ? 24 : 16}
                    className={active ? 'text-icon-normal' : 'text-icon-alternative'}
                  />
                  {!collapsed && <span className="whitespace-nowrap">{label}</span>}
                </Link>
              </MemberNavTooltip>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MemberNavTooltip({
  label,
  enabled,
  children,
}: {
  label: string;
  enabled: boolean;
  children: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Tooltip open={enabled && open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={6} align="center" variant="dark">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export { MemberNavGroup };
