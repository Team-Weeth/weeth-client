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
import { LABEL_CLASS } from '@/components/calendar/calendarScheduleDetailConstants';
import { useScheduleDetailDerived } from '@/hooks/useScheduleDetailDerived';
import { formatScheduleTimeRange } from '@/utils/shared/date';
import TimeIcon from '@/assets/icons/time.svg';
import LocationIcon from '@/assets/icons/location.svg';
import DeleteIcon from '@/assets/icons/delete.svg';
import type { ScheduleDetail } from '@/types/calendar';

interface ScheduleDetailContentProps {
  schedule: ScheduleDetail;
  onViewAttendees: () => void;
  onClose?: () => void;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

function ScheduleDetailContent({
  schedule,
  onViewAttendees,
  onClose,
  footer,
  children,
}: ScheduleDetailContentProps) {
  const { typeLabel, tagVariant, visibleAttendees, remainingCount, hasDetails } =
    useScheduleDetailDerived(schedule);

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between py-600 pr-400 pl-700">
        <div className="flex flex-col gap-400">
          <h2 className="typo-h3 text-text-strong">{schedule.title}</h2>
          <div className="flex flex-wrap items-center gap-200">
            <Tag variant={tagVariant}>{typeLabel}</Tag>
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
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="hover:bg-container-neutral-interaction flex size-[40px] shrink-0 cursor-pointer items-center justify-center rounded-sm transition-colors"
        >
          <Icon src={DeleteIcon} size={28} className="text-icon-normal" />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-500 px-700 pb-500">
        {hasDetails && (
          <div className="border-line flex flex-col gap-[14px] border-t pt-600">
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
                  <Avatar size={28} type="round" colorScheme="white">
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
                <span className={cn(LABEL_CLASS, 'pt-[2px]')}>설명</span>
                <span className="typo-body2 text-text-normal flex-1 whitespace-pre-wrap">
                  {schedule.description}
                </span>
              </div>
            )}
          </div>
        )}

        {children}
      </div>

      {footer}
    </>
  );
}

export { ScheduleDetailContent, type ScheduleDetailContentProps };
