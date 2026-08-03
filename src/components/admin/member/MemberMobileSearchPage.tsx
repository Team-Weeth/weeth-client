'use client';

import { useEffect, useRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';

import { SearchIcon } from '@/assets/icons';
import { AdminCloseIcon } from '@/assets/icons/admin';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { Member } from '@/types/admin/member';
import type { MemberSortBy } from '@/utils/admin/memberPageUtils';
import { MemberCardList } from './MemberCardList';
import { MemberTable } from './MemberTable';
import type { MemberViewMode } from './MemberViewToggle';

interface MemberMobileSearchPageProps extends HTMLAttributes<HTMLDivElement> {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onCancel: () => void;
  viewMode: MemberViewMode;
  members: Member[];
  page: number;
  totalPages: number;
  sortBy: MemberSortBy;
  selectedIds: Set<string>;
  onPageChange: (page: number) => void;
  onToggleSort: () => void;
  onSelectionChange: (ids: Set<string>) => void;
  onMemberAction?: (member: Member) => void;
  listFooter?: ReactNode;
}

function MemberMobileSearchPage({
  className,
  searchQuery,
  onSearchQueryChange,
  onCancel,
  viewMode,
  members,
  page,
  totalPages,
  sortBy,
  selectedIds,
  onPageChange,
  onToggleSort,
  onSelectionChange,
  onMemberAction,
  listFooter,
  ...props
}: MemberMobileSearchPageProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasSearchQuery = searchQuery.trim().length > 0;
  const hasSearchResults = members.length > 0;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <section className={cn('tablet:hidden flex min-h-0 flex-1 flex-col', className)} {...props}>
      <div className="flex shrink-0 items-center gap-300 px-450 py-400">
        <div className="border-line bg-container-neutral-alternative flex h-[34px] min-w-0 flex-1 items-center rounded-[10px] border px-[11px] py-200">
          <Icon src={SearchIcon} size={16} className="text-icon-alternative shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="이름, 역할, 학과..."
            className="typo-body2 text-text-normal placeholder:text-text-disabled min-w-0 flex-1 bg-transparent py-[2px] pl-200 focus:outline-none"
          />
          <button
            type="button"
            aria-label="검색어 지우기"
            className="text-icon-alternative hover:text-icon-strong flex size-[18px] shrink-0 cursor-pointer items-center justify-center rounded-sm transition-colors"
            onClick={() => onSearchQueryChange('')}
          >
            <Icon src={AdminCloseIcon} size={14} />
          </button>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="typo-body1 text-text-alternative shrink-0 cursor-pointer rounded-sm py-100"
        >
          취소
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-450">
        {hasSearchQuery && !hasSearchResults && (
          <div className="typo-body1 text-text-alternative flex shrink-0 justify-center pt-600">
            검색 결과가 없습니다.
          </div>
        )}

        {hasSearchQuery &&
          hasSearchResults &&
          (viewMode === 'card' ? (
            <MemberCardList
              members={members}
              page={page}
              totalPages={totalPages}
              sortBy={sortBy}
              selectedIds={selectedIds}
              onPageChange={onPageChange}
              onToggleSort={onToggleSort}
              onSelectionChange={onSelectionChange}
              onMemberAction={onMemberAction}
              showSortControl={false}
            />
          ) : (
            <MemberTable
              members={members}
              page={page}
              totalPages={totalPages}
              selectedIds={selectedIds}
              onPageChange={onPageChange}
              onSelectionChange={onSelectionChange}
              onMemberAction={onMemberAction}
            />
          ))}

        {hasSearchQuery && hasSearchResults && listFooter}
      </div>
    </section>
  );
}

export { MemberMobileSearchPage, type MemberMobileSearchPageProps };
