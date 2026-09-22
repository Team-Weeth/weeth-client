'use client';

import type { ReactNode } from 'react';
import { CustomAlertDialog } from '@/components/alert';

const DISCARD_ALERT_TITLE = '변경사항이 있어요.\n변경사항을 폐기할까요?';

type Placement = 'above-right' | 'below-right' | 'above-left' | 'below-left';

interface DiscardConfirmAreaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  placement: Placement;
  children: ReactNode;
}

function DiscardConfirmArea({
  open,
  onOpenChange,
  onConfirm,
  placement,
  children,
}: DiscardConfirmAreaProps) {
  return (
    <CustomAlertDialog
      open={open}
      onOpenChange={onOpenChange}
      title={DISCARD_ALERT_TITLE}
      actionLabel="변경사항 폐기"
      onAction={onConfirm}
      placement={placement}
    >
      {children}
    </CustomAlertDialog>
  );
}

export { DiscardConfirmArea, type DiscardConfirmAreaProps };
