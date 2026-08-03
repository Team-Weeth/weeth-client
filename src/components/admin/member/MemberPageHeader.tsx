'use client';

import { useRouter } from 'next/navigation';

import { BackIcon, ConvertIcon, SearchIcon } from '@/assets/icons';
import { Icon } from '@/components/ui';
import type { Cardinal } from '@/types/admin/cardinal';
import type { MemberSortBy } from '@/utils/admin/memberPageUtils';
import { CardinalPillList } from './CardinalPillList';
import { MemberSearchBar } from './MemberSearchBar';
import { MemberViewToggle, type MemberViewMode } from './MemberViewToggle';

interface MemberPageHeaderProps {
  cardinals: Cardinal[];
  selectedCardinal: number | 'all';
  onSelectCardinal: (cardinal: number | 'all') => void;
  sortBy: MemberSortBy;
  onToggleSort: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  mobileViewMode: MemberViewMode;
  onMobileViewModeChange: (mode: MemberViewMode) => void;
  onOpenMobileSearch: () => void;
}

function MemberPageHeader({
  cardinals,
  selectedCardinal,
  onSelectCardinal,
  sortBy,
  onToggleSort,
  searchQuery,
  onSearchQueryChange,
  mobileViewMode,
  onMobileViewModeChange,
  onOpenMobileSearch,
}: MemberPageHeaderProps) {
  const router = useRouter();

  return (
    <section className="flex shrink-0 flex-col">
      <div className="tablet:hidden flex flex-col">
        <div className="flex items-center justify-between px-200 py-100">
          <button
            type="button"
            aria-label="뒤로가기"
            className="text-icon-normal flex size-9 cursor-pointer items-center justify-center rounded-sm"
            onClick={() => router.back()}
          >
            <Icon src={BackIcon} size={17} />
          </button>

          <button
            type="button"
            aria-label="멤버 검색"
            className="text-icon-normal flex size-9 cursor-pointer items-center justify-center rounded-sm"
            onClick={onOpenMobileSearch}
          >
            <Icon src={SearchIcon} size={20} />
          </button>
        </div>

        <div className="my-300 flex items-center justify-between px-450">
          <h1 className="typo-h3 text-text-strong">멤버관리</h1>
          <MemberViewToggle value={mobileViewMode} onValueChange={onMobileViewModeChange} />
        </div>
      </div>

      <div className="max-tablet:hidden flex h-[100px] items-center justify-between px-700 py-700">
        <h1 className="typo-h2 text-text-strong">멤버관리</h1>

        <div className="flex items-center gap-400">
          <MemberSearchBar value={searchQuery} onValueChange={onSearchQueryChange} />
          <div className="bg-line h-3.5 w-px" aria-hidden />
          <button
            type="button"
            onClick={onToggleSort}
            className="typo-sub1 text-text-alternative hover:text-text-strong max-tablet:hidden flex h-9 cursor-pointer items-center gap-200 rounded-sm px-200 transition-colors"
            aria-label={`${sortBy === 'cardinal' ? '이름' : '기수'} 순으로 정렬`}
          >
            <Icon src={ConvertIcon} size={20} className="text-icon-alternative" />
            {sortBy === 'cardinal' ? '기수 순' : '이름 순'}
          </button>
        </div>
      </div>

      <div className="max-tablet:px-0 flex h-14 items-end overflow-hidden px-700">
        <CardinalPillList
          cardinals={cardinals}
          selectedCardinal={selectedCardinal}
          onSelectCardinal={onSelectCardinal}
        />
      </div>
    </section>
  );
}

export { MemberPageHeader, type MemberPageHeaderProps };
