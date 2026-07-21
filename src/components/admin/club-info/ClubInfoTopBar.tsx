'use client';

import { type HTMLAttributes, useRef, useState } from 'react';

import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';

import { ArrowLeftIcon } from '@/assets/icons';
import { InfoCircleIcon } from '@/assets/icons';
import { Button, Icon } from '@/components/ui';
import { cn } from '@/lib/cn';

interface ClubInfoTopBarProps extends HTMLAttributes<HTMLDivElement> {
  onBack: () => void;
  onSave: () => void;
  isSaving?: boolean;
  open?: boolean;
}

type Placement = 'below-right' | 'below-left';

function DiscardAlertDialog({
  onAction,
  placement,
  children,
}: {
  onAction: () => void;
  placement: Placement;
  children: React.ReactNode;
}) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const dialogWidth = Math.min(339, viewportWidth - 16);
      const margin = 8;
      const top = rect.bottom + 8;
      const rawLeft = placement === 'below-right' ? rect.left : rect.right - dialogWidth;
      const left = Math.min(Math.max(rawLeft, margin), viewportWidth - dialogWidth - margin);
      setPosition({ top, left });
    }
  };

  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <div ref={triggerRef}>{children}</div>

      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
        <AlertDialogPrimitive.Content
          style={position ? { top: position.top, left: position.left } : undefined}
          className="bg-background border-line data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed z-50 w-[339px] max-w-[calc(100vw-16px)] rounded-lg border shadow-[0px_10px_40px_0px_rgba(0,0,0,0.5)] duration-200"
        >
          <div className="flex flex-col items-center gap-600 px-400 py-400">
            <div className="bg-state-error/10 flex items-center rounded-full p-300">
              <Icon src={InfoCircleIcon} size={24} className="text-state-error" />
            </div>
            <div className="flex flex-col items-center gap-200 text-center">
              <AlertDialogPrimitive.Title className="typo-sub1 text-text-strong whitespace-pre-line">
                {'변경사항이 있어요.\n변경사항을 폐기할까요?'}
              </AlertDialogPrimitive.Title>
            </div>
          </div>
          <div className="flex flex-col gap-200 p-400">
            <div className="border-line border-t" />
            <AlertDialogPrimitive.Action asChild>
              <button
                type="button"
                onClick={onAction}
                className={cn(
                  'typo-button1 bg-button-neutral text-state-error w-full cursor-pointer rounded-md px-400 py-300 transition-colors',
                  'hover:bg-state-error/10 active:bg-state-error/15',
                )}
              >
                변경사항 폐기
              </button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}

function ClubInfoTopBar({ className, onBack, onSave, isSaving, open = true, ...props }: ClubInfoTopBarProps) {
  return (
    <div
      className={cn(
        'overflow-hidden transition-[height] duration-200',
        open ? 'h-15' : 'h-0',
        className,
      )}
      {...props}
    >
    <div
      data-state={open ? 'open' : 'closed'}
      className={cn(
        'bg-container-primary flex h-15 items-center px-500',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
        'duration-200',
      )}
    >
      <DiscardAlertDialog onAction={onBack} placement="below-right">
        <AlertDialogPrimitive.Trigger asChild>
          <button
            type="button"
            className="data-[state=open]:bg-button-primary-interaction flex shrink-0 cursor-pointer items-center justify-center p-200 data-[state=open]:rounded-sm"
          >
            <Icon src={ArrowLeftIcon} alt="뒤로" size={16} className="text-icon-inverse" />
          </button>
        </AlertDialogPrimitive.Trigger>
      </DiscardAlertDialog>

      <span className="typo-sub1 text-text-inverse ml-200 shrink-0">수정 모드</span>

      <div className="ml-auto flex shrink-0 gap-200">
        <DiscardAlertDialog onAction={onBack} placement="below-left">
          <AlertDialogPrimitive.Trigger asChild>
            <Button variant="secondary" size="md" className="py-200">
              취소
            </Button>
          </AlertDialogPrimitive.Trigger>
        </DiscardAlertDialog>
        <Button
          variant="secondary"
          size="md"
          className="py-200"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? '저장 중...' : '저장'}
        </Button>
      </div>
    </div>
    </div>
  );
}

export { ClubInfoTopBar, type ClubInfoTopBarProps };
