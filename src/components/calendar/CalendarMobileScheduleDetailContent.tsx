'use client';

import { cn } from '@/lib/cn';
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
import { LABEL_CLASS } from '@/components/calendar/calendarScheduleDetailConstants';
import { useScheduleDetailDerived } from '@/hooks/useScheduleDetailDerived';
import { formatScheduleTimeRange } from '@/utils/shared/date';
import CalendarIcon from '@/assets/icons/calendar.svg';
import LocationIcon from '@/assets/icons/location.svg';
import type { ScheduleDetail } from '@/types/calendar';

interface CalendarMobileScheduleDetailContentProps {
  schedule: ScheduleDetail;
  clubId?: string | null;
  onViewAttendees: () => void;
  /**
   * 장소·주최자·설명 값의 타이포. 기본값은 typo-body2.
   * 어드민 영역([data-admin])에서는 typo-body2가 13px로 줄어들어, default Body2가 필요하면 지정한다.
   */
  valueTypography?: string;
}

function CalendarMobileScheduleDetailContent({
  schedule,
  clubId,
  onViewAttendees,
  valueTypography = 'typo-body2',
}: CalendarMobileScheduleDetailContentProps) {
  const {
    resolvedClubId,
    typeLabel,
    tagVariant,
    visibleAttendees,
    remainingCount,
    dDayLabel,
    hasDetails,
    showAttendanceCard,
    attendanceStatus,
  } = useScheduleDetailDerived(schedule, clubId);

  return (
    <div className="flex flex-col px-450 pb-700">
      {/* Header */}
      <div className="border-line flex flex-col gap-300 border-b pt-200 pb-400">
        <div className="flex flex-col gap-300">
          <Tag variant={tagVariant}>{typeLabel}</Tag>
          <h2 className="typo-h3 text-text-strong">{schedule.title}</h2>
        </div>
        <div className="flex flex-wrap gap-200">
          <Tag variant="end">
            <Icon src={CalendarIcon} size={16} className="text-icon-alternative" />
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
                <span className={cn(valueTypography, 'text-text-normal')}>{schedule.location}</span>
              </div>
            </div>
          )}
          {schedule.host && (
            <div className="flex items-center gap-300">
              <span className={LABEL_CLASS}>주최</span>
              <div className="flex items-center gap-200">
                <Avatar size={28} type="round" colorScheme="white">
                  {schedule.host.imageUrl ? (
                    <AvatarImage src={schedule.host.imageUrl} alt={schedule.host.name} />
                  ) : null}
                  <AvatarFallback variant="person" />
                </Avatar>
                <span className={cn(valueTypography, 'text-text-normal')}>
                  {schedule.host.name}
                </span>
              </div>
            </div>
          )}
          {(visibleAttendees.length > 0 || (schedule.attendeeCount ?? 0) > 0) && (
            <div className="flex items-center gap-300">
              <span className={LABEL_CLASS}>참석자</span>
              <button
                type="button"
                aria-label={`참석자 ${schedule.attendeeCount ?? visibleAttendees.length}명 목록 보기`}
                className="flex cursor-pointer items-center gap-200 rounded-sm transition-opacity hover:opacity-75"
                onClick={onViewAttendees}
              >
                <AvatarGroup>
                  {visibleAttendees.map((attendee, idx) => (
                    <Avatar key={`${attendee.name}-${idx}`} size={28} type="round">
                      {attendee.imageUrl ? (
                        <AvatarImage src={attendee.imageUrl} alt={attendee.name} />
                      ) : null}
                      <AvatarFallback variant="person" />
                    </Avatar>
                  ))}
                  {remainingCount > 0 && <AvatarGroupCount>+{remainingCount}</AvatarGroupCount>}
                </AvatarGroup>
              </button>
            </div>
          )}
          {schedule.description && (
            <div className="flex items-start gap-300">
              <span className={LABEL_CLASS}>설명</span>
              <span className={cn(valueTypography, 'text-text-normal flex-1 whitespace-pre-wrap')}>
                {schedule.description}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { CalendarMobileScheduleDetailContent, type CalendarMobileScheduleDetailContentProps };
