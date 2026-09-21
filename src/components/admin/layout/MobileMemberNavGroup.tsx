'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import PeopleIcon from '@/assets/icons/people.svg';
import ArrowFillDownIcon from '@/assets/icons/arrow_fill_down.svg';
import ListIcon from '@/assets/icons/admin/ic_admin_list.svg';
import PersonIcon from '@/assets/icons/admin/ic_admin_person.svg';
import { Icon } from '@/components/ui/Icon';
import { SheetClose } from '@/components/ui/Sheet';
import { cn } from '@/lib/cn';

function MobileMemberNavGroup({ clubId, pathname }: { clubId: string; pathname: string }) {
  const memberPath = `/${clubId}/admin/member`;
  // 현재 보고 있는 페이지가 하위 메뉴면 펼친 채로 연다. (데스크톱 LNB와 동일)
  const [open, setOpen] = useState(pathname.startsWith(memberPath));
  const menuId = useId();
  const items = [
    { label: '멤버 목록', icon: ListIcon, path: memberPath },
    { label: '부원 정보', icon: PersonIcon, path: `${memberPath}/position-settings` },
  ];

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className="typo-sub1 text-text-normal hover:bg-background flex w-full cursor-pointer items-center justify-between rounded-md px-400 py-[14px]"
      >
        <span className="flex items-center gap-300">
          <Icon src={PeopleIcon} size={24} className="text-icon-normal" />
          멤버 관리
        </span>
        <Icon
          src={ArrowFillDownIcon}
          size={24}
          className={cn(
            'text-icon-normal transition-transform duration-200 motion-reduce:transition-none',
            !open && '-rotate-90',
          )}
        />
      </button>
      <div
        id={menuId}
        aria-hidden={!open}
        inert={!open}
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-200 ease-in-out motion-reduce:transition-none',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="mx-400 flex flex-col gap-200 pt-200">
            {items.map(({ label, icon, path }) => (
              <SheetClose key={path} asChild>
                <Link
                  href={path}
                  aria-current={pathname === path ? 'page' : undefined}
                  className={cn(
                    'typo-sub1 text-text-normal hover:bg-background flex items-center gap-300 rounded-md px-400 py-300',
                    pathname === path && 'bg-container-neutral-alternative',
                  )}
                >
                  <Icon src={icon} size={24} className="text-icon-normal" />
                  {label}
                </Link>
              </SheetClose>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export { MobileMemberNavGroup };
