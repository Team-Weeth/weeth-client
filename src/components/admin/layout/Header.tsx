'use client';

import { useState } from 'react';

import AdminCloseIcon from '@/assets/icons/admin/ic_admin_close.svg';
import AdminMenuIcon from '@/assets/icons/admin/ic_admin_menu.svg';
import { AdminMobileNavSheet } from '@/components/admin/layout/AdminMobileNavSheet';
import { ThemeModeToggle } from '@/components/admin/layout/ThemeModeToggle';
import { ClubAvatar } from '@/components/ui/ClubAvatar';
import { Icon } from '@/components/ui/Icon';
import { Sheet, SheetClose, SheetTrigger } from '@/components/ui/Sheet';
import { useAdminClubQuery } from '@/hooks/queries/admin/useAdminClubQuery';
import { useAdminLNBActions, useAdminLNBCollapsed } from '@/stores/useAdminLNBStore';

const LNB_WIDTH_COLLAPSED = 88; // w-22
const LNB_WIDTH_EXPANDED = 240; // w-60

export function Header() {
  const { toggleCollapsed } = useAdminLNBActions();
  const collapsed = useAdminLNBCollapsed();
  const lnbWidth = collapsed ? LNB_WIDTH_COLLAPSED : LNB_WIDTH_EXPANDED;
  const { data: club } = useAdminClubQuery();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <Sheet onOpenChange={setSheetOpen}>
      <header className="bg-background shrink-0">
        {/* 모바일 헤더 */}
        <div className="border-line tablet:hidden flex items-center justify-between border-b px-500 py-300">
          <ClubAvatar src={club?.profileImageUrl ?? null} name={club?.name ?? ''} size={36} />
          <div className="flex items-center gap-300">
            {/* 검색 아이콘 - 추후 구현 예정
            <button
              type="button"
              aria-label="검색"
              className="hover:bg-container-neutral-interaction flex cursor-pointer items-center justify-center rounded-sm p-100 transition-colors"
            >
              <Icon src={AdminSearchIcon} size={24} className="text-icon-normal" aria-hidden />
            </button>
            */}
            {sheetOpen ? (
              <SheetClose asChild>
                <button
                  type="button"
                  aria-label="관리자 메뉴 닫기"
                  className="hover:bg-container-neutral-interaction flex cursor-pointer items-center justify-center rounded-sm p-100 transition-colors"
                >
                  <Icon
                    src={AdminCloseIcon}
                    size={24}
                    className="text-icon-alternative"
                    aria-hidden
                  />
                </button>
              </SheetClose>
            ) : (
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="관리자 메뉴 열기"
                  className="hover:bg-container-neutral-interaction flex cursor-pointer items-center justify-center rounded-sm p-100 transition-colors"
                >
                  <Icon
                    src={AdminMenuIcon}
                    size={24}
                    className="text-icon-alternative"
                    aria-hidden
                  />
                </button>
              </SheetTrigger>
            )}
          </div>
        </div>

        {/* 태블릿/데스크톱 헤더 */}
        <div
          className="tablet:grid hidden items-center transition-[grid-template-columns] duration-200"
          style={{ gridTemplateColumns: `${lnbWidth}px 1fr` }}
        >
          {/* LNB 영역: 토글 버튼 */}
          <div className="flex items-center px-450 py-300">
            <button
              type="button"
              aria-label={collapsed ? '관리자 메뉴 펼치기' : '관리자 메뉴 접기'}
              onClick={toggleCollapsed}
              className="hover:bg-container-neutral-interaction flex cursor-pointer items-center justify-center rounded-sm p-200 transition-colors"
            >
              <Icon src={AdminMenuIcon} size={24} className="text-icon-normal" aria-hidden />
            </button>
          </div>

          {/* TODO: 검색 기능 구현 후 주석 해제 */}
          {/* <div className="flex items-center py-300">
            <div className="bg-container-neutral-alternative flex h-10 flex-1 items-center gap-400 rounded-md py-200 pr-400 pl-300">
              <Icon src={AdminSearchIcon} size={20} className="text-icon-alternative shrink-0" />
              <span className="typo-button2 text-text-alternative">검색...</span>
            </div>
          </div> */}

          {/* 우측 액션: 화면 모드 토글 */}
          {/* TODO: 구분선은 검색창 구현 후 재활성화 */}
          <div className="flex shrink-0 items-center gap-700 justify-self-end py-300 pr-450">
            {/* <div className="bg-line h-6 w-px" /> */}
            <ThemeModeToggle />
          </div>
        </div>

        <AdminMobileNavSheet />
      </header>
    </Sheet>
  );
}
