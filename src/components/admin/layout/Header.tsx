'use client';

import { AdminMenuIcon, AdminSearchIcon } from '@/assets/icons/admin';
import { Icon } from '@/components/ui';
import { useAdminLNBActions, useAdminLNBCollapsed } from '@/stores/useAdminLNBStore';

const LNB_WIDTH_COLLAPSED = 88; // w-22
const LNB_WIDTH_EXPANDED = 240; // w-60
import { ThemeModeToggle } from '@/components/admin/layout/ThemeModeToggle';

export function Header() {
  const { toggleCollapsed } = useAdminLNBActions();
  const collapsed = useAdminLNBCollapsed();
  const lnbWidth = collapsed ? LNB_WIDTH_COLLAPSED : LNB_WIDTH_EXPANDED;

  return (
    <header
      className="bg-background grid shrink-0 transition-[grid-template-columns] duration-200"
      style={{ gridTemplateColumns: `${lnbWidth}px 1fr auto` }}
    >
      {/* LNB 영역: 토글 버튼 */}
      <div className="flex items-center px-450 py-300">
        <button
          type="button"
          onClick={toggleCollapsed}
          className="hover:bg-container-neutral-interaction flex cursor-pointer items-center justify-center rounded-sm p-200 transition-colors"
        >
          <Icon src={AdminMenuIcon} size={24} className="text-icon-normal" />
        </button>
      </div>

      {/* 검색창 영역 */}
      <div className="flex items-center py-300">
        <div className="bg-container-neutral-alternative flex h-10 flex-1 items-center gap-400 rounded-md py-200 pr-400 pl-300">
          <Icon src={AdminSearchIcon} size={20} className="text-icon-alternative shrink-0" />
          <span className="typo-button2 text-text-alternative">검색...</span>
        </div>
      </div>

      {/* 우측 액션: 구분선 - 화면 모드 토글 */}
      <div className="ml-[38px] flex h-10 shrink-0 items-center gap-700 py-300 pr-450">
        <div className="bg-line h-6 w-px" />
        <ThemeModeToggle />
      </div>
    </header>
  );
}
