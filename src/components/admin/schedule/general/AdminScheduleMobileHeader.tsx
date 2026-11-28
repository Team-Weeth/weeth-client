'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { CardinalDropdown } from '@/components/common/CardinalDropdown';
import { MonthNavigator } from '@/components/admin/schedule/general/MonthNavigator';
import AdminBackIcon from '@/assets/icons/admin/ic_admin_back.svg';
import SearchIcon from '@/assets/icons/search.svg';
import type { Cardinal } from '@/types/admin/cardinal';

interface AdminScheduleMobileHeaderProps {
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
  /** 오늘이 아닌 날짜를 보고 있을 때만 [오늘] 버튼을 노출한다. */
  showTodayButton: boolean;
  cardinals: Cardinal[];
  activeCardinal?: Cardinal;
  onCardinalSelect: (id: number) => void;
  onCardinalSelectAll: () => void;
  onSearchClick: () => void;
}

function AdminScheduleMobileHeader({
  year,
  month,
  onPrevMonth,
  onNextMonth,
  onGoToToday,
  showTodayButton,
  cardinals,
  activeCardinal,
  onCardinalSelect,
  onCardinalSelectAll,
  onSearchClick,
}: AdminScheduleMobileHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-400">
      {/* Top row: back + search */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="뒤로 가기"
          // 아이콘 SVG 좌측 내부 여백(약 6px)을 상쇄해 타이틀과 좌측 정렬을 맞춘다
          className="-ml-100 flex cursor-pointer items-center justify-center"
          onClick={() => router.back()}
        >
          <Icon src={AdminBackIcon} size={24} className="text-icon-normal" />
        </button>
        <button
          type="button"
          aria-label="검색"
          className="flex cursor-pointer items-center justify-center"
          onClick={onSearchClick}
        >
          <Icon src={SearchIcon} size={21} className="text-icon-normal" />
        </button>
      </div>

      <div className="flex flex-col gap-300">
        {/* Title + cardinal row */}
        <div className="flex items-center justify-between">
          <h1 className="typo-h3 text-text-strong">일정 관리</h1>
          <CardinalDropdown
            cardinals={cardinals}
            activeCardinal={activeCardinal}
            onSelect={onCardinalSelect}
            onSelectAll={onCardinalSelectAll}
          />
        </div>

        {/* Month navigator + today — [오늘] 버튼 유무와 관계없이 행 높이를 버튼 높이(32px)로 고정해 레이아웃 이동을 막는다 */}
        <div className="flex h-700 items-center gap-400">
          <MonthNavigator
            year={year}
            month={month}
            onPrev={onPrevMonth}
            onNext={onNextMonth}
            className="justify-start"
          />
          {showTodayButton && (
            <button
              type="button"
              onClick={onGoToToday}
              className="border-line typo-caption1 text-text-normal flex h-700 cursor-pointer items-center justify-center rounded-full border px-300 transition-colors hover:border-neutral-500"
            >
              오늘
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export { AdminScheduleMobileHeader, type AdminScheduleMobileHeaderProps };
