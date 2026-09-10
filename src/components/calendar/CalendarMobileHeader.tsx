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

interface MobileBackHeaderProps {
  onBack: () => void;
  title: string;
}

function MobileBackHeader({ onBack, title }: MobileBackHeaderProps) {
  return (
    <div className="flex items-center">
      <button
        type="button"
        aria-label="닫기"
        onClick={onBack}
        className="flex size-8 cursor-pointer items-center justify-center"
      >
        <Icon src={BackIcon} size={17} className="text-icon-normal" />
      </button>
      <span className="typo-sub1 text-text-normal">{title}</span>
    </div>
  );
}

function CalendarMobileHeader({ children }: CalendarMobileHeaderProps) {
  const monthPickerOpen = useCalendarMonthPickerOpen();
  const scheduleDetailOpen = useCalendarScheduleDetailOpen();
  const attendeeListOpen = useCalendarAttendeeListOpen();
  const { closeMonthPicker, closeScheduleDetail, closeAttendeeList } = useCalendarActions();

  if (attendeeListOpen) return <MobileBackHeader onBack={closeAttendeeList} title="참석자 목록" />;
  if (scheduleDetailOpen)
    return <MobileBackHeader onBack={closeScheduleDetail} title="일정 상세" />;
  if (monthPickerOpen) return <MobileBackHeader onBack={closeMonthPicker} title="월 이동" />;

  return <>{children}</>;
}

export { CalendarMobileHeader };
