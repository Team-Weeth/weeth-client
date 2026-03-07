import { Button, Chip, ChipList } from '@/components/ui';

export function TodayScheduleBox() {
  return (
    <div className="bg-container-neutral rounded-lg">
      <p className="typo-sub1 text-text-strong p-450">오늘의 일정</p>
      <div className="flex flex-col gap-[14px] p-450">
        <p className="typo-sub1 text-text-strong">8주차 정기모임</p>
        <ChipList>
          <Chip shape="round">7월 18일 (19:00 ~ 20:30)</Chip>
          <Chip shape="round">가천관 247호</Chip>
        </ChipList>
        <Button variant="primary" size="lg" className="w-full">
          출석하기
        </Button>
      </div>
    </div>
  );
}
