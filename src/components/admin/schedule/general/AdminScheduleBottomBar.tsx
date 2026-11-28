'use client';

import Link from 'next/link';
import { cn } from '@/lib/cn';
import { Button, buttonVariants } from '@/components/ui/Button';

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

export { AdminScheduleBottomBar, type AdminScheduleBottomBarProps };
