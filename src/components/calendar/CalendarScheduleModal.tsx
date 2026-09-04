'use client';

import { useState } from 'react';
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';
import { cn } from '@/lib/cn';
import { AlertDialogPortal, AlertDialogOverlay } from '@/components/ui/alert-dialog';
import { CalendarScheduleDetailContent } from '@/components/calendar/CalendarScheduleDetailContent';
import { CalendarAttendeeListContent } from '@/components/calendar/CalendarAttendeeListContent';
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
  const [view, setView] = useState<'detail' | 'attendees'>('detail');

  if (!schedule) return null;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setView('detail');
    onOpenChange(nextOpen);
  };

  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <AlertDialogPortal>
        <AlertDialogOverlay onClick={() => handleOpenChange(false)} />
        <AlertDialogPrimitive.Content
          aria-label={view === 'detail' ? schedule.title : '참석자 목록'}
          className={cn(
            'bg-background border-line border',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'fixed top-1/2 left-1/2 z-[80] max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2',
            view === 'detail' ? 'w-[600px]' : 'w-[688px]',
            'flex flex-col rounded-lg duration-200',
            '[box-shadow:var(--shadow-dialog)]',
          )}
        >
          {view === 'detail' ? (
            <CalendarScheduleDetailContent
              schedule={schedule}
              clubId={clubId}
              onShare={onShare}
              onViewAttendees={() => setView('attendees')}
            />
          ) : (
            <CalendarAttendeeListContent
              attendees={schedule.attendees ?? []}
              onBack={() => setView('detail')}
            />
          )}
        </AlertDialogPrimitive.Content>
      </AlertDialogPortal>
    </AlertDialogPrimitive.Root>
  );
}

export { CalendarScheduleModal, type CalendarScheduleModalProps };
