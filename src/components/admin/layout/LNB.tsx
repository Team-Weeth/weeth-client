'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import userIcon from '@/assets/icons/admin/ic_admin_user.svg';
import checkIcon from '@/assets/icons/admin/ic_admin_attendance.svg';
import penaltyIcon from '@/assets/icons/admin/ic_admin_penalty.svg';
import dueIcon from '@/assets/icons/admin/ic_admin_due.svg';
import arrowIcon from '@/assets/icons/admin/ic_admin_service_transfer.svg';
import manualIcon from '@/assets/icons/admin/ic_admin_manual.svg';

import { cn } from '@/lib/cn';

const mainNavItems = [
  { id: 'member', icon: userIcon, label: '멤버 관리', path: '/admin/member' },
  { id: 'attendance', icon: checkIcon, label: '출석 관리', path: '/admin/attendance' },
  { id: 'penalty', icon: penaltyIcon, label: '페널티 관리', path: '/admin/penalty' },
  { id: 'dues', icon: dueIcon, label: '회비 관리', path: '/admin/dues' },
];

const moveNavItems = [
  { id: 'service', icon: arrowIcon, label: 'Weeth로 이동', path: 'https://weeth.kr' },
  { id: 'manual', icon: manualIcon, label: '관리자 매뉴얼', path: '' },
];

const navItemClass = cn(
  'typo-sub1 flex h-12 items-center gap-300 rounded-sm px-300 transition-colors',
  'text-text-alternative hover:bg-container-neutral-interaction',
);

export function LNB() {
  const pathname = usePathname();

  return (
    <nav className="border-line bg-container-neutral flex h-full w-60 shrink-0 flex-col border-r px-300 py-500">
      <div className="flex flex-col gap-100">
        {mainNavItems.map(({ id, icon, label, path }) => {
          const isActive = pathname.startsWith(path);
          return (
            <Link
              key={id}
              href={path}
              className={cn(
                navItemClass,
                isActive && 'bg-container-neutral-interaction text-text-strong',
              )}
            >
              <Image src={icon} alt={label} width={24} height={24} />
              {label}
            </Link>
          );
        })}
      </div>

      <div className="mt-400 flex flex-col gap-100">
        <span className="typo-caption1 text-text-alternative px-300 py-100">이동</span>
        {moveNavItems.map(({ id, icon, label, path }) => {
          const isExternal = id === 'service';

          if (!path) {
            return (
              <div key={id} className={navItemClass}>
                <Image src={icon} alt={label} width={24} height={24} />
                {label}
              </div>
            );
          }

          return (
            <Link
              key={id}
              href={path}
              className={navItemClass}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
            >
              <Image src={icon} alt={label} width={24} height={24} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
