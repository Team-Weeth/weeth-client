'use client';

import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button, Chip, ChipList } from '@/components/ui';
import { AttendanceCodeModal } from '@/components/attendance/AttendanceCodeModal';
import { useAttendanceQuery, useCheckIn } from '@/hooks/attendance';
import { useIsAdmin } from '@/hooks/shared';
import { formatDateWithTimeRange } from '@/utils/shared/date';
import { EmptyBox } from '@/components/home/EmptyBox';

const CardinalMissingModal = dynamic(() =>
  import('@/components/home/CardinalMissingModal').then((m) => m.CardinalMissingModal),
);

export function TodayScheduleBox() {
  const router = useRouter();
  const { data, isError, refetch } = useAttendanceQuery();
  const { isAdmin } = useIsAdmin();
  const {
    isChecked,
    checkInError,
    codeModalOpen,
    setCodeModalOpen,
    cardinalModalOpen,
    setCardinalModalOpen,
    handleCheckIn,
  } = useCheckIn();

  return (
    <div className="bg-container-neutral rounded-lg">
      <p className="typo-sub1 text-text-strong p-450">오늘의 일정</p>
      {isError ? (
        <div className="flex items-center justify-between px-450 pb-450">
          <p className="typo-body2 text-text-alternative">일정을 불러오지 못했습니다.</p>
          <button type="button" className="typo-body2 text-brand-primary" onClick={() => refetch()}>
            다시 시도
          </button>
        </div>
      ) : data?.title ? (
        <div className="flex flex-col gap-[14px] p-450">
          <p className="typo-sub3 text-text-strong">{data.title}</p>
          <ChipList>
            <Chip shape="round">{formatDateWithTimeRange(data.start!, data.end!)}</Chip>
            <Chip shape="round">{data.location}</Chip>
          </ChipList>
          {checkInError && (
            <div className="flex items-center justify-between">
              <p className="typo-caption2 text-state-error">출석 처리 중 오류가 발생했습니다.</p>
              <button
                type="button"
                className="typo-caption2 text-brand-primary"
                onClick={() => setCodeModalOpen(true)}
              >
                다시 시도
              </button>
            </div>
          )}
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
            onConfirm={handleCheckIn}
            title={data.title}
            start={data.start ?? ''}
            endTime={data.end ?? ''}
            location={data.location ?? ''}
          />
        </div>
      ) : isAdmin ? (
        <div className="px-450 pb-450">
          <EmptyBox
            description="출석이 필요한 정기모임 정보가 없습니다."
            button={{ label: '출석 일정 추가하기', onClick: () => router.push('/admin/schedule') }}
          />
        </div>
      ) : (
        <div className="px-450 pb-450">
          <EmptyBox description="출석할 일정이 없습니다." />
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
