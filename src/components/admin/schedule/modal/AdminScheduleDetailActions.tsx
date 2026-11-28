'use client';

import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { ADMIN_DEFAULT_TYPO } from '@/constants/admin/typography.constants';

// 디자인은 default Button1(16px / 24px). 어드민 영역의 typo-button1은 14px이라 상수로 지정하고,
// size="lg"(typo-button1 포함) 대신 lg와 같은 여백·모서리를 직접 지정한다.
const ACTION_BUTTON_CLASS = cn(ADMIN_DEFAULT_TYPO.button1, 'flex-1 rounded-md px-400 py-300');

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
