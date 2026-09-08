'use client';

import { Icon } from '@/components/ui/Icon';
import BackIcon from '@/assets/icons/back.svg';
import {
  useCalendarMonthPickerOpen,
  useCalendarScheduleDetailOpen,
  useCalendarAttendeeListOpen,
  useCalendarActions,
} from '@/stores/useCalendarStore';

interface CalendarMobileHeaderProps {
  children: React.ReactNode;
}

function CalendarMobileHeader({ children }: CalendarMobileHeaderProps) {
  const monthPickerOpen = useCalendarMonthPickerOpen();
  const scheduleDetailOpen = useCalendarScheduleDetailOpen();
  const attendeeListOpen = useCalendarAttendeeListOpen();
  const { closeMonthPicker, closeScheduleDetail, closeAttendeeList } = useCalendarActions();

  if (attendeeListOpen) {
    return (
      <div className="flex items-center">
        <button
          type="button"
          aria-label="닫기"
          onClick={closeAttendeeList}
          className="flex size-8 cursor-pointer items-center justify-center"
        >
          <Icon src={BackIcon} size={17} className="text-icon-normal" />
        </button>
        <span className="typo-sub1 text-text-normal">참석자 목록</span>
      </div>
    );
  }

  if (scheduleDetailOpen) {
    return (
      <div className="flex items-center">
        <button
          type="button"
          aria-label="닫기"
          onClick={closeScheduleDetail}
          className="flex size-8 cursor-pointer items-center justify-center"
        >
          <Icon src={BackIcon} size={17} className="text-icon-normal" />
        </button>
        <span className="typo-sub1 text-text-normal">일정 상세</span>
      </div>
    );
  }

  if (monthPickerOpen) {
    return (
      <div className="flex items-center">
        <button
          type="button"
          aria-label="닫기"
          onClick={closeMonthPicker}
          className="flex size-8 cursor-pointer items-center justify-center"
        >
          <Icon src={BackIcon} size={17} className="text-icon-normal" />
        </button>
        <span className="typo-sub1 text-text-normal">월 이동</span>
      </div>
    );
  }

  return <>{children}</>;
}

export { CalendarMobileHeader };
