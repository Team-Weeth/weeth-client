import {
  SCHEDULE_TYPE_LABEL,
  SCHEDULE_TYPE_TAG_VARIANT,
  MAX_VISIBLE_ATTENDEES,
} from '@/components/calendar/calendarScheduleDetailConstants';
import { formatDDay } from '@/utils/shared/date';
import type { ScheduleDetail } from '@/types/calendar';

function useScheduleDetailDerived(schedule: ScheduleDetail, clubId?: string | null) {
  const resolvedClubId = schedule.clubId ?? clubId ?? null;
  const typeLabel = SCHEDULE_TYPE_LABEL[schedule.type] ?? schedule.type;
  const tagVariant = SCHEDULE_TYPE_TAG_VARIANT[schedule.type] ?? 'primary';
  const visibleAttendees = schedule.attendees?.slice(0, MAX_VISIBLE_ATTENDEES) ?? [];
  const remainingCount =
    schedule.attendeeCount != null
      ? schedule.attendeeCount - visibleAttendees.length
      : (schedule.attendees?.length ?? 0) - visibleAttendees.length;
  const dDayLabel = schedule.dDay != null ? formatDDay(schedule.dDay) : null;
  const hasDetails = !!(
    schedule.location ||
    schedule.host ||
    visibleAttendees.length > 0 ||
    (schedule.attendeeCount ?? 0) > 0 ||
    schedule.description
  );
  const showAttendanceCard = schedule.hasAttendanceCheck && schedule.type === 'SESSION';
  const attendanceStatus = schedule.attendanceStatus ?? 'UPCOMING';

  return {
    resolvedClubId,
    typeLabel,
    tagVariant,
    visibleAttendees,
    remainingCount,
    dDayLabel,
    hasDetails,
    showAttendanceCard,
    attendanceStatus,
  };
}

export { useScheduleDetailDerived };
