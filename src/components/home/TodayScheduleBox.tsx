'use client';

import { Button, Chip, ChipList } from '@/components/ui';
import { useAttendanceQuery } from '@/hooks/attendance';
import { formatDateWithTimeRange } from '@/utils/shared/date';

export function TodayScheduleBox() {
  const { data } = useAttendanceQuery();

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
      ) : (
        <p className="typo-body2 text-text-alternative px-450 pb-450">오늘 출석 일정이 없습니다.</p>
      )}
    </div>
  );
}
