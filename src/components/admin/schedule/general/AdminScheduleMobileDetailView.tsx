'use client';

import { useState } from 'react';
import { CalendarMobileScheduleDetailContent } from '@/components/calendar/CalendarMobileScheduleDetailContent';
import { CalendarAttendeeListContent } from '@/components/calendar/CalendarAttendeeListContent';
import { CalendarMobileScheduleDetailContentSkeleton } from '@/components/calendar/skeleton/CalendarMobileScheduleDetailContentSkeleton';
import { AdminScheduleMobileBackHeader } from '@/components/admin/schedule/general/AdminScheduleMobileBackHeader';
import { AdminScheduleDetailActions } from '@/components/admin/schedule/modal/AdminScheduleDetailActions';
import { useAdminScheduleDetailQuery } from '@/hooks/queries/admin/useAdminScheduleDetailQuery';
import { ADMIN_DEFAULT_TYPO } from '@/constants/admin/typography.constants';
import type { Schedule } from '@/types/admin/schedule';

interface AdminScheduleMobileDetailViewProps {
  schedule: Schedule;
  onBack: () => void;
  onEdit: (schedule: Schedule) => void;
  onDelete: (schedule: Schedule) => void;
}

/** 모바일 일정 관리의 [일정 상세]·[참석자 목록] 화면. 사용자 캘린더 모바일 화면과 같은 UI에 수정·삭제 버튼을 더한다. */
function AdminScheduleMobileDetailView({
  schedule,
  onBack,
  onEdit,
  onDelete,
}: AdminScheduleMobileDetailViewProps) {
  const [attendeeListOpen, setAttendeeListOpen] = useState(false);
  const { clubId, detail, isLoading } = useAdminScheduleDetailQuery(schedule);

  if (attendeeListOpen) {
    return (
      <div className="bg-background flex h-full flex-col">
        <AdminScheduleMobileBackHeader
          title="참석자 목록"
          onBack={() => setAttendeeListOpen(false)}
        />
        <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <CalendarAttendeeListContent
            attendees={detail.attendees ?? []}
            onBack={() => setAttendeeListOpen(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex h-full flex-col">
      <AdminScheduleMobileBackHeader title="일정 상세" onBack={onBack} />

      <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {isLoading ? (
          <CalendarMobileScheduleDetailContentSkeleton />
        ) : (
          <CalendarMobileScheduleDetailContent
            schedule={detail}
            clubId={clubId}
            onViewAttendees={() => setAttendeeListOpen(true)}
            // 디자인은 default Body2(14px). 어드민 영역의 typo-body2는 13px이다.
            valueTypography={ADMIN_DEFAULT_TYPO.body2}
          />
        )}
      </div>

      <AdminScheduleDetailActions
        onEdit={() => onEdit(schedule)}
        onDelete={() => onDelete(schedule)}
        className="bg-background shrink-0 px-450 pt-300 pb-800"
      />
    </div>
  );
}

export { AdminScheduleMobileDetailView, type AdminScheduleMobileDetailViewProps };
