'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { UpcomingItem } from '@/components/calendar/CalendarUpcomingPanel';
import AdminSearchSmallIcon from '@/assets/icons/admin/ic_admin_search_small.svg';
import AdminDeleteIcon from '@/assets/icons/admin/ic_admin_delete.svg';
import { matchesScheduleQuery } from '@/utils/admin/scheduleUtils';
import type { ScheduleDetail } from '@/types/calendar';

interface AdminScheduleMobileSearchProps {
  schedules: ScheduleDetail[];
  onClose: () => void;
  onScheduleClick: (schedule: ScheduleDetail) => void;
}

function AdminScheduleMobileSearch({
  schedules,
  onClose,
  onScheduleClick,
}: AdminScheduleMobileSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // TODO: [백엔드] 검색 대상이 현재 조회 중인 월의 일정(schedules)뿐이다. 다른 달 일정까지 검색해야 하면
  // 제목·장소 검색 API(기간 무관)가 필요하다. 제공되면 이 클라이언트 필터를 서버 검색 쿼리로 교체한다.
  const query = searchQuery.trim();
  const filtered = query ? schedules.filter((s) => matchesScheduleQuery(s, query)) : [];

  return (
    <section className="tablet:hidden fixed inset-0 z-10 flex flex-col bg-neutral-300">
      {/* Search bar */}
      <div className="flex shrink-0 items-center gap-300 px-450 py-400">
        <div className="border-line flex h-[36px] min-w-0 flex-1 items-center rounded-[10px] border bg-neutral-200 px-[11px] py-200">
          <Icon src={AdminSearchSmallIcon} size={16} className="text-icon-alternative shrink-0" />
          <input
            ref={inputRef}
            type="text"
            aria-label="일정 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="일정 검색"
            className="typo-body2 text-text-disabled placeholder:text-text-disabled min-w-0 flex-1 bg-transparent py-[2px] pl-200 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="검색어 지우기"
              className="text-icon-alternative hover:text-icon-strong ml-100 flex size-[18px] shrink-0 cursor-pointer items-center justify-center rounded-sm transition-colors"
              onClick={() => setSearchQuery('')}
            >
              <Icon src={AdminDeleteIcon} size={14} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="typo-body1 text-text-alternative hover:text-text-strong active:text-text-strong shrink-0 cursor-pointer rounded-sm py-100 transition-colors"
        >
          취소
        </button>
      </div>

      {/* Results */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-450">
        {query && filtered.length === 0 && (
          <div className="typo-body1 text-text-alternative flex shrink-0 justify-center pt-600">
            검색 결과가 없습니다.
          </div>
        )}

        {query && filtered.length > 0 && (
          <TooltipProvider>
            <div className="flex flex-col gap-300">
              {filtered.map((schedule) => (
                <UpcomingItem
                  key={schedule.id}
                  schedule={schedule}
                  showDateColumn={false}
                  onScheduleClick={onScheduleClick}
                />
              ))}
            </div>
          </TooltipProvider>
        )}
      </div>
    </section>
  );
}

export { AdminScheduleMobileSearch, type AdminScheduleMobileSearchProps };
