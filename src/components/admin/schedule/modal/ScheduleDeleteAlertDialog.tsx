'use client';

import { useState } from 'react';
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import AdminDeleteForeverIcon from '@/assets/icons/admin/ic_admin_delete_forever.svg';
import type { ScheduleType } from '@/types/admin/schedule';

const DELETE_COPY: Record<ScheduleType, { title: string; description: string }> = {
  EVENT: {
    title: '해당 일반 일정을 삭제하시겠어요?',
    description: '삭제된 일정은 복구가 불가능합니다.',
  },
  SESSION: {
    title: '해당 세션을 삭제하시겠어요?',
    description: '삭제된 세션은 복구가 불가능합니다.',
  },
};

const IN_PROGRESS_TITLE = '출석 진행 중인 세션은\n삭제 할 수 없어요.';

interface ScheduleDeleteAlertDialogProps {
  /** 제어 모드. 생략하면 trigger로 여닫는 비제어 모드로 동작한다. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 비제어 모드에서 다이얼로그를 여는 요소 */
  trigger?: React.ReactElement;
  /** 삭제 대상 유형. 기본 문구를 고르는 데 쓴다. */
  scheduleType?: ScheduleType;
  /** 출석 진행 중인 세션이면 삭제 확인 대신 [확인]만 있는 안내를 표시한다. */
  inProgress?: boolean;
  title?: string;
  description?: string;
  onConfirm: () => void;
  className?: string;
}

/**
 * 일정 삭제 확인 다이얼로그. 일정 목록·일정 관리·일정 수정 모달에서 공통으로 쓴다.
 * document.body로 포털되어 [data-admin] 밖에서 렌더링되므로 타이포가 디자인의 default 스케일로 적용된다.
 */
function ScheduleDeleteAlertDialog({
  open,
  onOpenChange,
  trigger,
  scheduleType = 'EVENT',
  inProgress = false,
  title,
  description,
  onConfirm,
  className,
}: ScheduleDeleteAlertDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : uncontrolledOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  const resolvedTitle = title ?? (inProgress ? IN_PROGRESS_TITLE : DELETE_COPY[scheduleType].title);
  const resolvedDescription =
    description ?? (inProgress ? undefined : DELETE_COPY[scheduleType].description);

  return (
    <AlertDialogPrimitive.Root open={currentOpen} onOpenChange={setOpen}>
      {trigger && <AlertDialogPrimitive.Trigger asChild>{trigger}</AlertDialogPrimitive.Trigger>}
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-90 bg-black/60"
          onClick={() => setOpen(false)}
        />
        <AlertDialogPrimitive.Content
          className={cn(
            'bg-background border-line data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-90 w-[339px] max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border duration-200',
            className,
          )}
          style={{ boxShadow: 'var(--shadow-dialog)' }}
        >
          {/* Content area */}
          <div className="flex flex-col items-center gap-400 px-400 pt-500 pb-400">
            <div className="bg-state-error/10 flex items-center rounded-full p-300">
              <Icon src={AdminDeleteForeverIcon} size={24} className="text-state-error" />
            </div>
            <div className="flex w-full flex-col gap-200 text-center">
              <AlertDialogPrimitive.Title className="typo-sub1 text-text-strong whitespace-pre-line">
                {resolvedTitle}
              </AlertDialogPrimitive.Title>
              {resolvedDescription ? (
                <AlertDialogPrimitive.Description className="typo-body2 text-text-alternative whitespace-pre-line">
                  {resolvedDescription}
                </AlertDialogPrimitive.Description>
              ) : (
                // Radix가 aria-describedby 대상이 없다고 경고하지 않도록 빈 설명을 숨겨 둔다.
                <AlertDialogPrimitive.Description className="sr-only">
                  {resolvedTitle}
                </AlertDialogPrimitive.Description>
              )}
            </div>
          </div>

          {/* Action area */}
          <div className="flex flex-col gap-200 p-400">
            <div className="border-line border-t" />
            {inProgress ? (
              <AlertDialogPrimitive.Cancel asChild>
                <Button variant="danger" size="lg" className="w-full">
                  확인
                </Button>
              </AlertDialogPrimitive.Cancel>
            ) : (
              <>
                <AlertDialogPrimitive.Action asChild>
                  <Button variant="danger" size="lg" className="w-full" onClick={onConfirm}>
                    삭제
                  </Button>
                </AlertDialogPrimitive.Action>
                <AlertDialogPrimitive.Cancel asChild>
                  <Button variant="secondary" size="lg" className="text-text-strong w-full">
                    취소
                  </Button>
                </AlertDialogPrimitive.Cancel>
              </>
            )}
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}

export { ScheduleDeleteAlertDialog, type ScheduleDeleteAlertDialogProps };
