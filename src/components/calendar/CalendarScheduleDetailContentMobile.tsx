'use client';

import { Icon } from '@/components/ui/Icon';
import { Tag } from '@/components/ui/tag';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from '@/components/ui/avatar';
import { CalendarScheduleAttendanceCard } from '@/components/calendar/CalendarScheduleAttendanceCard';
import { formatDDay, formatScheduleTimeRange } from '@/utils/shared/date';
import TimeIcon from '@/assets/icons/time.svg';
import LocationIcon from '@/assets/icons/location.svg';
import type { ScheduleDetail } from '@/types/calendar';

const LABEL_CLASS = 'typo-caption2 text-text-alternative w-[56px] shrink-0';

const SCHEDULE_TYPE_LABEL: Record<string, string> = {
  SESSION: '세션',
  EVENT: '일반 일정',
};

const SCHEDULE_TYPE_TAG_VARIANT: Record<string, 'primary' | 'secondary'> = {
  SESSION: 'primary',
  EVENT: 'secondary',
};

const MAX_VISIBLE_ATTENDEES = 5;

interface CalendarScheduleDetailContentMobileProps {
  schedule: ScheduleDetail;
  clubId?: string | null;
  onViewAttendees: () => void;
}

function CalendarScheduleDetailContentMobile({
  schedule,
  clubId,
  onViewAttendees,
}: CalendarScheduleDetailContentMobileProps) {
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

  return (
    <div className="flex flex-col px-450 pb-700">
      {/* Header */}
      <div className="border-line flex flex-col gap-300 border-b pt-200 pb-400">
        <div className="flex flex-col gap-200">
          <Tag variant={tagVariant}>{typeLabel}</Tag>
          <h2 className="typo-h3 text-text-strong">{schedule.title}</h2>
        </div>
        <div className="flex flex-wrap gap-200">
          <Tag variant="end">
            <Icon src={TimeIcon} size={16} className="text-icon-alternative" />
            {formatScheduleTimeRange(schedule.start, schedule.end)}
          </Tag>
          {schedule.location && (
            <Tag variant="end">
              <Icon src={LocationIcon} size={16} className="text-icon-alternative" />
              {schedule.location}
            </Tag>
          )}
        </div>
      </div>

      {/* Attendance card — between header and details */}
      {showAttendanceCard && (
        <div className="pt-400 pb-500">
          <CalendarScheduleAttendanceCard
            attendanceStatus={attendanceStatus}
            dDayLabel={dDayLabel}
            attendanceCompletedAt={schedule.attendanceCompletedAt}
            clubId={resolvedClubId}
          />
        </div>
      )}

      {/* Details */}
      {hasDetails && (
        <div className="border-line flex flex-col gap-500 border-t py-600">
          {schedule.location && (
            <div className="flex items-center gap-300">
              <span className={LABEL_CLASS}>장소</span>
              <div className="flex items-center gap-200">
                <Icon src={LocationIcon} size={18} className="text-icon-alternative" />
                <span className="typo-body2 text-text-normal">{schedule.location}</span>
              </div>
            </div>
          )}
          {schedule.host && (
            <div className="flex items-center gap-300">
              <span className={LABEL_CLASS}>주최</span>
              <div className="flex items-center gap-200">
                <Avatar size={24} type="round">
                  {schedule.host.imageUrl ? (
                    <AvatarImage src={schedule.host.imageUrl} alt={schedule.host.name} />
                  ) : null}
                  <AvatarFallback variant="person" />
                </Avatar>
                <span className="typo-body2 text-text-normal">{schedule.host.name}</span>
              </div>
            </div>
          )}
          {(visibleAttendees.length > 0 || (schedule.attendeeCount ?? 0) > 0) && (
            <div className="flex items-center gap-300">
              <span className={LABEL_CLASS}>참석자</span>
              <button
                type="button"
                className="flex cursor-pointer items-center gap-200 rounded-sm transition-opacity hover:opacity-75"
                onClick={onViewAttendees}
              >
                <AvatarGroup>
                  {visibleAttendees.map((attendee, idx) => (
                    <Avatar key={`${attendee.name}-${idx}`} size={24} type="round">
                      {attendee.imageUrl ? (
                        <AvatarImage src={attendee.imageUrl} alt={attendee.name} />
                      ) : null}
                      <AvatarFallback variant="person" />
                    </Avatar>
                  ))}
                  {remainingCount > 0 && <AvatarGroupCount>+{remainingCount}</AvatarGroupCount>}
                </AvatarGroup>
                {schedule.showAttendeeCount === true && schedule.attendeeCount != null && (
                  <span className="typo-caption2 text-text-alternative">
                    총 {schedule.attendeeCount}명
                  </span>
                )}
              </button>
            </div>
          )}
          {schedule.description && (
            <div className="flex items-start gap-300">
              <span className={`${LABEL_CLASS} pt-[2px]`}>설명</span>
              <span className="typo-body2 text-text-normal flex-1">{schedule.description}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { CalendarScheduleDetailContentMobile, type CalendarScheduleDetailContentMobileProps };
