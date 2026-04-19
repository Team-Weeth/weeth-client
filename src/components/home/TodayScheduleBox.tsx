'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Chip, ChipList } from '@/components/ui';
import { AttendanceCodeModal } from '@/components/attendance/AttendanceCodeModal';
import { useAttendanceQuery } from '@/hooks/attendance';
import { useProfileStatusQuery } from '@/hooks/home/useProfileStatusQuery';
import { useIsAdmin } from '@/hooks/shared';
import { attendanceApi } from '@/lib/apis/attendance';
import { formatDateWithTimeRange } from '@/utils/shared/date';
import { ATTENDANCE_ERROR_MESSAGE } from '@/constants/attendance';
import { useClubId } from '@/stores/useClubStore';
import { toastError } from '@/stores/useToastStore';
import { EmptyBox } from '@/components/home/EmptyBox';

const CardinalMissingModal = dynamic(() =>
  import('@/components/home/CardinalMissingModal').then((m) => m.CardinalMissingModal),
);

export function TodayScheduleBox() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clubId = useClubId();
  const { data } = useAttendanceQuery();
  const { data: profileStatus, isLoading: isProfileLoading } = useProfileStatusQuery();
  const { isAdmin } = useIsAdmin();
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [cardinalModalOpen, setCardinalModalOpen] = useState(false);
  const [checkedSessionId, setCheckedSessionId] = useState<number | null>(null);

  const isChecked = data?.status === 'ATTEND' || checkedSessionId === data?.sessionId;

  async function handleAttendanceComplete(code: string) {
    if (!isProfileLoading && profileStatus?.cardinalAssigned === false) {
      setCardinalModalOpen(true);
      return;
    }
    if (!clubId || !data?.sessionId) return;

    try {
      await attendanceApi.checkIn(clubId, data.sessionId, Number(code));
    } catch (error) {
      const errorCode = (error as { response?: { data?: { code?: number } } }).response?.data?.code;
      toastError(errorCode ? ATTENDANCE_ERROR_MESSAGE[errorCode] : undefined);
      return;
    }

    setCheckedSessionId(data.sessionId);
    queryClient.invalidateQueries({ queryKey: ['attendance', clubId] });
  }

  return (
    <div className="bg-container-neutral rounded-lg">
      <p className="typo-sub1 text-text-strong p-450">오늘의 일정</p>
      {data?.title ? (
        <div className="flex flex-col gap-[14px] p-450">
          <p className="typo-sub3 text-text-strong">{data.title}</p>
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

      <CardinalMissingModal
        open={cardinalModalOpen}
        onClose={() => setCardinalModalOpen(false)}
        description="출석을 위해 기수 정보가 필요합니다."
      />
    </div>
  );
}
