'use client';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ScheduleDetailContent } from '@/components/ui/schedule/ScheduleDetailContent';
import { CalendarScheduleAttendanceCard } from '@/components/calendar/CalendarScheduleAttendanceCard';
import { CalendarModalFooter } from '@/components/calendar/CalendarModalFooter';
import { useScheduleDetailDerived } from '@/hooks/useScheduleDetailDerived';
import ExitToAppIcon from '@/assets/icons/exit_to_app.svg';
import type { ScheduleDetail } from '@/types/calendar';

interface CalendarScheduleDetailContentProps {
  schedule: ScheduleDetail;
  clubId?: string | null;
  onViewAttendees: () => void;
  onClose?: () => void;
  onShare?: () => void;
}

function CalendarScheduleDetailContent({
  schedule,
  clubId,
  onViewAttendees,
  onClose,
  onShare,
}: CalendarScheduleDetailContentProps) {
  const { resolvedClubId, dDayLabel, showAttendanceCard, attendanceStatus } =
    useScheduleDetailDerived(schedule, clubId);

  return (
    <ScheduleDetailContent
      schedule={schedule}
      onViewAttendees={onViewAttendees}
      onClose={onClose}
      footer={
        <CalendarModalFooter>
          <Button variant="secondary" size="lg" className="w-full gap-200" onClick={onShare}>
            <Icon src={ExitToAppIcon} size={20} className="text-icon-normal" />
            공유하기
          </Button>
        </CalendarModalFooter>
      }
    >
      {showAttendanceCard && (
        <CalendarScheduleAttendanceCard
          attendanceStatus={attendanceStatus}
          dDayLabel={dDayLabel}
          attendanceCompletedAt={schedule.attendanceCompletedAt}
          clubId={resolvedClubId}
        />
      )}
    </ScheduleDetailContent>
  );
}

export { CalendarScheduleDetailContent, type CalendarScheduleDetailContentProps };
