'use client';

import Link from 'next/link';
import { cn } from '@/lib/cn';
import { Button, buttonVariants } from '@/components/ui/Button';

/**
 * 하단 고정 바가 가리는 높이(위 여백 12 + 버튼 48 + 아래 여백 40 이상).
 * 바 아래로 스크롤되는 목록의 하단 여백으로 쓴다. 바의 여백·버튼 크기를 바꾸면 함께 수정한다.
 */
const ADMIN_SCHEDULE_BOTTOM_BAR_OFFSET_CLASS = 'pb-[120px]';

interface AdminScheduleBottomBarProps {
  overviewHref: string;
  onCreateClick: () => void;
}

function AdminScheduleBottomBar({ overviewHref, onCreateClick }: AdminScheduleBottomBarProps) {
  return (
    <div
      className="bg-container-neutral tablet:hidden fixed right-0 bottom-0 left-0 z-10 flex gap-[10px] px-450 pt-300"
      style={{ paddingBottom: 'max(40px, env(safe-area-inset-bottom, 40px))' }}
    >
      <Link
        href={overviewHref}
        className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }), 'flex-1')}
      >
        일정 모아보기
      </Link>
      <Button variant="primary" size="lg" className="flex-1" onClick={onCreateClick}>
        일정 추가
      </Button>
    </div>
  );
}

export {
  AdminScheduleBottomBar,
  ADMIN_SCHEDULE_BOTTOM_BAR_OFFSET_CLASS,
  type AdminScheduleBottomBarProps,
};
