'use client';

import { CalendarMonthPicker } from '@/components/calendar/CalendarMonthPicker';
import { AdminScheduleMobileBackHeader } from '@/components/admin/schedule/general/AdminScheduleMobileBackHeader';

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
    <div className="flex flex-col">
      <AdminScheduleMobileBackHeader title="월 이동" onBack={onBack} />

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
