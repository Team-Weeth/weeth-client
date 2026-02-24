'use client';

import Link from 'next/link';
import type { StaticImageData } from 'next/image';
import { usePathname } from 'next/navigation';

import logoIcon from '@/assets/icons/logo/logo_initial_Origin.svg';
import userIcon from '@/assets/icons/admin/ic_admin_user.svg';
import checkIcon from '@/assets/icons/admin/ic_admin_attendance.svg';
import penaltyIcon from '@/assets/icons/admin/ic_admin_penalty.svg';
// import dueIcon from '@/assets/icons/admin/ic_admin_due.svg';
import arrowIcon from '@/assets/icons/admin/ic_admin_service_transfer.svg';
import manualIcon from '@/assets/icons/admin/ic_admin_manual.svg';

import { cn } from '@/lib/cn';

const mainNavItems = [
  { id: 'member', icon: userIcon, label: '멤버 관리', path: '/admin/member' },
  { id: 'attendance', icon: checkIcon, label: '출석 관리', path: '/admin/attendance' },
  { id: 'penalty', icon: penaltyIcon, label: '페널티 관리', path: '/admin/penalty' },
  // { id: 'dues', icon: dueIcon, label: '회비 관리', path: '/admin/dues' },
];

const moveNavItems = [
  { id: 'service', icon: arrowIcon, label: 'WEETH로 이동', path: 'https://weeth.kr' },
  {
    id: 'manual',
    icon: manualIcon,
    label: '관리자 매뉴얼',
    path: 'https://weeth-develop-2.s3.ap-northeast-2.amazonaws.com/Weeth_%E1%84%80%E1%85%AA%E1%86%AB%E1%84%85%E1%85%B5%E1%84%8C%E1%85%A1_%E1%84%86%E1%85%A6%E1%84%82%E1%85%B2%E1%84%8B%E1%85%A5%E1%86%AF_v3.pdf',
  },
];

function NavIcon({ src, isActive }: { src: StaticImageData | string; isActive: boolean }) {
  const url = typeof src === 'string' ? src : (src as StaticImageData).src;
  return (
    <span
      aria-hidden
      className={cn(
        'block h-6 w-6 shrink-0',
        isActive ? 'bg-brand-primary' : 'bg-text-alternative',
      )}
      style={{
        maskImage: `url(${url})`,
        WebkitMaskImage: `url(${url})`,
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        maskSize: 'contain',
      }}
    />
  );
}

const navItemClass =
  'typo-sub1 flex h-12 items-center gap-300 px-300 transition-colors text-text-alternative hover:bg-container-neutral-interaction';

export function LNB() {
  const pathname = usePathname();

  return (
    <nav className="border-line bg-container-neutral flex h-full w-60 shrink-0 flex-col border-r">
      {/* LNB 헤더 */}
      <div className="flex items-center gap-300 px-300 pt-[8px]">
        <span
          aria-label="Weeth"
          className="bg-text-alternative block h-10 w-10 shrink-0"
          style={{
            maskImage: `url(${(logoIcon as StaticImageData).src})`,
            WebkitMaskImage: `url(${(logoIcon as StaticImageData).src})`,
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            maskSize: 'contain',
          }}
        />
        <span className="typo-sub2 text-text-alternative">WEETH ADMIN</span>
      </div>

      {/* 관리 메뉴 */}
      <div className="flex flex-col">
        <span className="typo-caption1 text-text-alternative px-400 pt-500 pb-300">관리 메뉴</span>
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
              <NavIcon src={icon} isActive={isActive} />
              {label}
            </Link>
          );
        })}

        {/* 이동 */}
        <div>
          <span className="typo-caption1 text-text-alternative block px-400 pt-500 pb-300">
            이동
          </span>
          {moveNavItems.map(({ id, icon, label, path }) => {
            const inner = (
              <>
                <NavIcon src={icon} isActive={false} />
                {label}
              </>
            );

            if (id === 'manual') {
              return (
                <button
                  key={id}
                  className={cn(navItemClass, 'w-full cursor-pointer')}
                  onClick={() => window.open(path, '_blank')}
                >
                  {inner}
                </button>
              );
            }

            return (
              <Link
                key={id}
                href={path}
                className={navItemClass}
                target="_blank"
                rel="noopener noreferrer"
              >
                {inner}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
