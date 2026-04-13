'use client';

import { useRouter } from 'next/navigation';
import { Button, Chip, ChipList } from '@/components/ui';
import { useAttendanceQuery } from '@/hooks/attendance';
import { useIsAdmin } from '@/hooks/home';
import { formatDateWithTimeRange } from '@/utils/shared/date';
import { EmptyBox } from './EmptyBox';

export function TodayScheduleBox() {
  const router = useRouter();
  const { data } = useAttendanceQuery();
  const isAdmin = useIsAdmin();

  return (
    <div className="bg-container-neutral rounded-lg">
      <p className="typo-sub1 text-text-strong p-450">오늘의 일정</p>
      {data?.title ? (
        <div className="flex flex-col gap-[14px] p-450">
          <p className="typo-sub1 text-text-strong">{data.title}</p>
          <ChipList>
            <Chip shape="round">{formatDateWithTimeRange(data.start!, data.end!)}</Chip>
            <Chip shape="round">{data.location}</Chip>
          </ChipList>
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={data.status === 'ATTEND'}
          >
            {data.status === 'ATTEND' ? '출석 완료' : '출석하기'}
          </Button>
        </div>
      ) : isAdmin ? (
        <div className="px-450 pb-450">
          <EmptyBox
            description="출석이 필요한 정기모임 정보가 없습니다"
            button={{ label: '출석 일정 추가하기', onClick: () => router.push('/admin') }}
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
