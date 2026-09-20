'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
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
  const memberPath = `/${clubId}/admin/member`;
  const [open, setOpen] = useState(pathname.startsWith(memberPath));
  const menuId = useId();
  const expanded = open;
  const items = [
    { label: '멤버 목록', icon: ListIcon, path: memberPath, active: pathname === memberPath },
    {
      label: '부원 정보',
      icon: PersonIcon,
      path: `${memberPath}/information-preview`,
      active: pathname.startsWith(`${memberPath}/information-preview`),
    },
  ];

  return (
    <div>
      <MemberNavTooltip label="멤버 관리" enabled={collapsed && !expanded}>
        <button
          type="button"
          aria-label="멤버 관리"
          aria-expanded={expanded}
          aria-controls={menuId}
          onClick={() => setOpen((previous) => !previous)}
          className={cn(
            'text-text-normal hover:bg-container-neutral-interaction flex w-full cursor-pointer items-center rounded-md',
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
                    'typo-sub3 text-text-normal hover:bg-container-neutral-interaction flex items-center rounded-md',
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
