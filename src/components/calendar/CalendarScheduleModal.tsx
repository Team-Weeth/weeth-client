'use client';

import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui/Icon';
import { Tag } from '@/components/ui/tag';
import { Button } from '@/components/ui/Button';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from '@/components/ui/avatar';
import { AlertDialogPortal, AlertDialogOverlay } from '@/components/ui/alert-dialog';
import { CalendarScheduleAttendanceCard } from '@/components/calendar/CalendarScheduleAttendanceCard';
import { formatDDay, formatScheduleTimeRange } from '@/utils/shared/date';
import TimeIcon from '@/assets/icons/time.svg';
import LocationIcon from '@/assets/icons/location.svg';
import DeleteIcon from '@/assets/icons/delete.svg';
import ExitToAppIcon from '@/assets/icons/exit_to_app.svg';
import type { ScheduleDetail } from '@/types/calendar';

interface CalendarScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: ScheduleDetail | null;
  clubId?: string | null;
  onShare?: () => void;
}

const SCHEDULE_TYPE_LABEL: Record<string, string> = {
  SESSION: '세션',
  EVENT: '일반 일정',
};

const SCHEDULE_TYPE_TAG_VARIANT: Record<string, 'primary' | 'secondary'> = {
  SESSION: 'primary',
  EVENT: 'secondary',
};

const MAX_VISIBLE_ATTENDEES = 5;

function CalendarScheduleModal({
  open,
  onOpenChange,
  schedule,
  clubId,
  onShare,
}: CalendarScheduleModalProps) {
  if (!schedule) return null;

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
  const attendanceStatus = schedule.attendanceStatus ?? 'pending';

  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPortal>
        <AlertDialogOverlay />
        <AlertDialogPrimitive.Content
          aria-label={schedule.title}
          className={cn(
            'bg-background border-line border',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'fixed top-1/2 left-1/2 z-[80] w-[600px] max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2',
            'flex flex-col rounded-lg duration-200',
            '[box-shadow:var(--shadow-dialog)]',
          )}
        >
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

            <AlertDialogPrimitive.Cancel asChild>
              <button
                type="button"
                aria-label="닫기"
                className="hover:bg-container-neutral-interaction flex size-[40px] shrink-0 cursor-pointer items-center justify-center rounded-sm transition-colors"
              >
                <Icon src={DeleteIcon} size={24} className="text-icon-normal" />
              </button>
            </AlertDialogPrimitive.Cancel>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-500 px-700 pb-500">
            {/* Details section */}
            {hasDetails && (
              <div className="border-line flex flex-col gap-[14px] border-t pt-600">
                {schedule.location && (
                  <div className="flex items-center gap-300">
                    <span className="typo-caption2 text-text-alternative w-[56px] shrink-0">
                      장소
                    </span>
                    <div className="flex items-center gap-200">
                      <Icon src={LocationIcon} size={18} className="text-icon-alternative" />
                      <span className="typo-body2 text-text-normal">{schedule.location}</span>
                    </div>
                  </div>
                )}
                {schedule.host && (
                  <div className="flex items-center gap-300">
                    <span className="typo-caption2 text-text-alternative w-[56px] shrink-0">
                      주최
                    </span>
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
                    <span className="typo-caption2 text-text-alternative w-[56px] shrink-0">
                      참석자
                    </span>
                    <div className="flex items-center gap-200">
                      <AvatarGroup>
                        {visibleAttendees.map((attendee) => (
                          <Avatar key={attendee.name} size={24} type="round">
                            {attendee.imageUrl ? (
                              <AvatarImage src={attendee.imageUrl} alt={attendee.name} />
                            ) : null}
                            <AvatarFallback variant="person" />
                          </Avatar>
                        ))}
                        {remainingCount > 0 && (
                          <AvatarGroupCount>+{remainingCount}</AvatarGroupCount>
                        )}
                      </AvatarGroup>
                      {schedule.showAttendeeCount === true && schedule.attendeeCount != null && (
                        <span className="typo-caption2 text-text-alternative">
                          총 {schedule.attendeeCount}명
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {schedule.description && (
                  <div className="flex items-start gap-300">
                    <span className="typo-caption2 text-text-alternative w-[56px] shrink-0 pt-[2px]">
                      설명
                    </span>
                    <span className="typo-body2 text-text-normal flex-1">
                      {schedule.description}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Attendance card — SESSION only */}
            {showAttendanceCard && (
              <CalendarScheduleAttendanceCard
                attendanceStatus={attendanceStatus}
                dDayLabel={dDayLabel}
                attendanceCompletedAt={schedule.attendanceCompletedAt}
                clubId={resolvedClubId}
              />
            )}
          </div>

          {/* Footer */}
          <div className="px-400 pb-400">
            <div className="border-line border-t pt-[10px]">
              <Button variant="secondary" size="lg" className="w-full gap-200" onClick={onShare}>
                <Icon src={ExitToAppIcon} size={20} className="text-icon-normal" />
                공유하기
              </Button>
            </div>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPortal>
    </AlertDialogPrimitive.Root>
  );
}

export { CalendarScheduleModal, type CalendarScheduleModalProps };
