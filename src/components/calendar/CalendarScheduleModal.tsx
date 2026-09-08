'use client';

import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';
import { cn } from '@/lib/cn';
import { AlertDialogPortal, AlertDialogOverlay } from '@/components/ui/alert-dialog';
import { CalendarScheduleDetailContent } from '@/components/calendar/CalendarScheduleDetailContent';
import { CalendarAttendeeListContent } from '@/components/calendar/CalendarAttendeeListContent';
import {
  useCalendarAttendeeListOpen,
  useCalendarActions,
} from '@/stores/useCalendarStore';
import type { ScheduleDetail } from '@/types/calendar';

interface CalendarScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: ScheduleDetail | null;
  clubId?: string | null;
  onShare?: () => void;
}

function CalendarScheduleModal({
  open,
  onOpenChange,
  schedule,
  clubId,
  onShare,
}: CalendarScheduleModalProps) {
  const attendeeListOpen = useCalendarAttendeeListOpen();
  const { openAttendeeList, closeAttendeeList } = useCalendarActions();

  if (!schedule) return null;

  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPortal>
        <AlertDialogOverlay onClick={() => onOpenChange(false)} />
        <AlertDialogPrimitive.Content
          aria-label={attendeeListOpen ? '참석자 목록' : schedule.title}
          className={cn(
            'bg-background border-line border',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'fixed top-1/2 left-1/2 z-[80] max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2',
            attendeeListOpen ? 'w-[688px]' : 'w-[600px]',
            'flex flex-col rounded-lg duration-200',
            '[box-shadow:var(--shadow-dialog)]',
          )}
        >
          {attendeeListOpen ? (
            <CalendarAttendeeListContent
              attendees={schedule.attendees ?? []}
              onBack={closeAttendeeList}
            />
          ) : (
            <CalendarScheduleDetailContent
              schedule={schedule}
              clubId={clubId}
              onShare={onShare}
              onViewAttendees={openAttendeeList}
            />
          )}
        </AlertDialogPrimitive.Content>
      </AlertDialogPortal>
    </AlertDialogPrimitive.Root>
  );
}

export { CalendarScheduleModal, type CalendarScheduleModalProps };
