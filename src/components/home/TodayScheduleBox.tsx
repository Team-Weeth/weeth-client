'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Chip, ChipList } from '@/components/ui';
import { AttendanceCodeModal } from '@/components/attendance/AttendanceCodeModal';
import { useAttendanceQuery } from '@/hooks/attendance';
import { useIsAdmin } from '@/hooks/shared';
import { attendanceApi } from '@/lib/apis/attendance';
import { formatDateWithTimeRange } from '@/utils/shared/date';
import { ATTENDANCE_ERROR_MESSAGE } from '@/constants/attendance';
import { useClubId } from '@/stores/useClubStore';
import { toastError } from '@/stores/useToastStore';
import { EmptyBox } from '@/components/home/EmptyBox';

export function TodayScheduleBox() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clubId = useClubId();
  const { data } = useAttendanceQuery();
  const { isAdmin } = useIsAdmin();
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [isManualChecked, setIsManualChecked] = useState(false);

  const isChecked = data?.status === 'ATTEND' || isManualChecked;

  async function handleAttendanceComplete(code: string) {
    if (!clubId || !data?.sessionId) return;

    try {
      await attendanceApi.checkIn(clubId, data.sessionId, Number(code));
      setIsManualChecked(true);
      queryClient.invalidateQueries({ queryKey: ['attendance', clubId] });
    } catch (error) {
      const errorCode = (error as { response?: { data?: { code?: number } } }).response?.data?.code;
      toastError(errorCode ? ATTENDANCE_ERROR_MESSAGE[errorCode] : undefined);
    }
  }

  return (
    <div className="bg-container-neutral rounded-lg">
      <p className="typo-sub2 text-text-strong p-450">오늘의 일정</p>
      {data?.title ? (
        <div className="flex flex-col gap-[14px] p-450">
          <p className="typo-sub2 text-text-strong">{data.title}</p>
          <ChipList>
            <Chip shape="round">{formatDateWithTimeRange(data.start!, data.end!)}</Chip>
            <Chip shape="round">{data.location}</Chip>
          </ChipList>
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isChecked}
            onClick={() => setCodeModalOpen(true)}
          >
            {isChecked ? '출석 완료' : '출석하기'}
          </Button>

          <AttendanceCodeModal
            open={codeModalOpen}
            onOpenChange={setCodeModalOpen}
            onConfirm={handleAttendanceComplete}
            title={data.title}
            start={data.start ?? ''}
            endTime={data.end ?? ''}
            location={data.location ?? ''}
          />
        </div>
      ) : isAdmin ? (
        <div className="px-450 pb-450">
          <EmptyBox
            description="출석이 필요한 정기모임 정보가 없습니다"
            button={{ label: '출석 일정 추가하기', onClick: () => router.push('/admin/schedule') }}
          />
        </div>
      ) : (
        <div className="px-450 pb-450">
          <EmptyBox description="출석할 일정이 없습니다" />
        </div>
      )}
    </div>
  );
}
