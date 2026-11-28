'use client';

import { Icon } from '@/components/ui/Icon';
import { CalendarMonthPicker } from '@/components/calendar/CalendarMonthPicker';
import AdminBackIcon from '@/assets/icons/admin/ic_admin_back.svg';

interface AdminScheduleMonthPickerViewProps {
  year: number;
  selectedMonth: number;
  onYearChange: (year: number) => void;
  onMonthSelect: (month: number) => void;
  onGoToToday: () => void;
  onBack: () => void;
}

/** 모바일 일정 관리의 [월 이동] 화면. 사용자 캘린더의 월 이동 화면과 동일한 CalendarMonthPicker를 쓴다. */
function AdminScheduleMonthPickerView({
  year,
  selectedMonth,
  onYearChange,
  onMonthSelect,
  onGoToToday,
  onBack,
}: AdminScheduleMonthPickerViewProps) {
  return (
    <div className="flex flex-col pt-400">
      <div className="flex items-center gap-200 px-450">
        <button
          type="button"
          aria-label="뒤로 가기"
          // 아이콘 SVG 좌측 내부 여백(약 6px)을 상쇄해 본문과 좌측 정렬을 맞춘다
          className="-ml-100 flex cursor-pointer items-center justify-center"
          onClick={onBack}
        >
          <Icon src={AdminBackIcon} size={24} className="text-icon-normal" />
        </button>
        {/* 디자인은 default Sub1(18px). 어드민 영역에는 18px 타이포가 없어 크기를 직접 지정한다. */}
        <h1 className="text-text-normal text-[18px] leading-[22px] font-semibold tracking-(--letter-spacing)">
          월 이동
        </h1>
      </div>

      <CalendarMonthPicker
        year={year}
        selectedMonth={selectedMonth}
        onYearChange={onYearChange}
        onMonthSelect={onMonthSelect}
        onGoToToday={onGoToToday}
      />
    </div>
  );
}

export { AdminScheduleMonthPickerView, type AdminScheduleMonthPickerViewProps };
