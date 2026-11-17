'use client';

import { useState } from 'react';
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { AlertDialogPortal, AlertDialogOverlay } from '@/components/ui/alert-dialog';
import { ScheduleDetailContent } from '@/components/ui/schedule/ScheduleDetailContent';
import { CalendarAttendeeListContent } from '@/components/calendar/CalendarAttendeeListContent';
import { CalendarModalFooter } from '@/components/calendar/CalendarModalFooter';
import { toCalendarScheduleDetail } from '@/utils/admin/scheduleUtils';
import type { Schedule } from '@/types/admin/schedule';

interface AdminScheduleDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: Schedule;
  onEdit: (schedule: Schedule) => void;
  onDelete: (schedule: Schedule) => void;
}

function AdminScheduleDetailModal({
  open,
  onOpenChange,
  schedule,
  onEdit,
  onDelete,
}: AdminScheduleDetailModalProps) {
  const [attendeeListOpen, setAttendeeListOpen] = useState(false);

  // TODO: 어드민 전용 일정 상세 API 연결 필요 — 현재는 목록 데이터(제목·일시·장소)만 표시됨.
  // admin detail API 제공 시 description·attendees·host 등 전체 필드를 채워야 한다.
  const detail = toCalendarScheduleDetail(schedule);

  const handleClose = () => onOpenChange(false);

  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPortal>
        <AlertDialogOverlay onClick={handleClose} />
        <AlertDialogPrimitive.Content
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
          <AlertDialogPrimitive.Title className="sr-only">
            {attendeeListOpen ? '참석자 목록' : detail.title}
          </AlertDialogPrimitive.Title>
          {attendeeListOpen ? (
            <CalendarAttendeeListContent
              attendees={detail.attendees ?? []}
              onBack={() => setAttendeeListOpen(false)}
            />
          ) : (
            <ScheduleDetailContent
              schedule={detail}
              onViewAttendees={() => setAttendeeListOpen(true)}
              onClose={handleClose}
              footer={
                <CalendarModalFooter>
                  <div className="flex gap-200">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="flex-1"
                      onClick={() => onDelete(schedule)}
                    >
                      삭제
                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      className="flex-1"
                      onClick={() => onEdit(schedule)}
                    >
                      수정
                    </Button>
                  </div>
                </CalendarModalFooter>
              }
            />
          )}
        </AlertDialogPrimitive.Content>
      </AlertDialogPortal>
    </AlertDialogPrimitive.Root>
  );
}

export { AdminScheduleDetailModal, type AdminScheduleDetailModalProps };
