'use client';

import { usePathname } from 'next/navigation';

import { useLogout } from '@/hooks';

const PAGE_TITLES: Record<string, string> = {
  '/admin/member': '멤버 관리',
  '/admin/schedule': '일정 관리',
  '/admin/attendance': '출석 관리',
  '/admin/board': '게시판 관리',
  '/admin/club-info': '동아리 관리',
};

export function Header() {
  const handleLogout = useLogout();
  const pathname = usePathname();

  const title = Object.entries(PAGE_TITLES).find(([path]) => pathname.includes(path))?.[1];

  return (
    <header className="bg-background flex w-full shrink-0 items-center gap-300 px-700 pt-2 pb-2">
      {title && <span className="typo-sub1 text-text-strong shrink-0">{title}</span>}

      <button
        type="button"
        onClick={handleLogout}
        className="border-line typo-button2 bg-button-neutral text-text-strong hover:bg-container-neutral-interaction ml-auto shrink-0 cursor-pointer rounded-sm border px-300 py-200"
      >
        Logout
      </button>
    </header>
  );
}
