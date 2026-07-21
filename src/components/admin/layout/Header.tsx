'use client';

import { AdminMenuIcon, AdminSearchIcon } from '@/assets/icons/admin';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useIsAdminEditMode } from '@/stores';
import { useAdminLNBActions, useAdminLNBCollapsed } from '@/stores/useAdminLNBStore';
import { ThemeModeToggle } from '@/components/admin/layout/ThemeModeToggle';

export function Header() {
  const { toggleCollapsed } = useAdminLNBActions();
  const collapsed = useAdminLNBCollapsed();
  const isEditMode = useIsAdminEditMode();

  if (isEditMode) return null;

  return (
    <header className="bg-background flex shrink-0 items-start px-450 py-300">
      <button
        type="button"
        onClick={toggleCollapsed}
        className="hover:bg-container-neutral-interaction flex cursor-pointer items-center justify-center rounded-sm p-200 transition-colors"
      >
        <Icon src={AdminMenuIcon} size={24} className="text-icon-normal" />
      </button>

      {/* LNB 너비(240 or 88) - 좌측 패딩(18) - 버튼(40) */}
      <div
        className={cn(
          'shrink-0 transition-[width] duration-200',
          collapsed ? 'w-[30px]' : 'w-[182px]',
        )}
      />

      <div className="bg-container-neutral-alternative flex h-10 flex-1 items-center gap-400 rounded-md py-200 pr-400 pl-300">
        <Icon src={AdminSearchIcon} size={20} className="text-icon-alternative shrink-0" />
        <span className="typo-button2 text-text-alternative">검색...</span>
      </div>

      {/* 검색창 우측: 38px gap - 구분선 - 32px gap - 화면 모드 토글 */}
      <div className="ml-[38px] flex h-10 shrink-0 items-center gap-700">
        <div className="bg-line h-6 w-px" />
        <ThemeModeToggle />
      </div>
    </header>
  );
}
