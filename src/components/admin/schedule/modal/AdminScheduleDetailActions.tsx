'use client';

import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';

// 디자인은 default Button1(16px / semibold). 어드민 영역에서 16px이 되는 타이포는 sub1뿐이다.
// size="lg"의 typo-button1과 함께 붙으면 어느 쪽이 적용될지 보장되지 않아, lg와 같은 여백·모서리를 직접 지정한다.
const ACTION_BUTTON_CLASS = 'typo-sub1 flex-1 rounded-md px-400 py-300';

interface AdminScheduleDetailActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

/** 일정 상세(모달·모바일 화면) 하단의 [수정] [삭제] 버튼. */
function AdminScheduleDetailActions({
  onEdit,
  onDelete,
  className,
}: AdminScheduleDetailActionsProps) {
  return (
    <div className={cn('flex gap-[10px]', className)}>
      <Button
        variant="secondary"
        size={null}
        className={cn(ACTION_BUTTON_CLASS, 'text-text-strong')}
        onClick={onEdit}
      >
        수정
      </Button>
      <Button variant="danger" size={null} className={ACTION_BUTTON_CLASS} onClick={onDelete}>
        삭제
      </Button>
    </div>
  );
}

export { AdminScheduleDetailActions, type AdminScheduleDetailActionsProps };
