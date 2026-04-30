'use client';

import type { ReactNode } from 'react';

import { CustomAlertDialog } from '@/components/alert';
import type { DiscardSource } from '@/hooks/useDiscardableForm';

interface DiscardMessages {
  title: string;
  actionLabel: string;
  cancelLabel?: string;
}

interface DiscardConfirmDialogProps {
  source: Exclude<DiscardSource, null>;
  currentSource: DiscardSource;
  placement: 'above-right' | 'below-right' | 'above-left' | 'below-left';
  messages: DiscardMessages;
  onConfirm: () => void;
  onDismiss: () => void;
  children: ReactNode;
}

function DiscardConfirmDialog({
  source,
  currentSource,
  placement,
  messages,
  onConfirm,
  onDismiss,
  children,
}: DiscardConfirmDialogProps) {
  return (
    <CustomAlertDialog
      open={currentSource === source}
      onOpenChange={(next) => {
        if (!next && currentSource === source) onDismiss();
      }}
      title={messages.title}
      actionLabel={messages.actionLabel}
      cancelLabel={messages.cancelLabel}
      onAction={onConfirm}
      onDismiss={onDismiss}
      placement={placement}
    >
      {children}
    </CustomAlertDialog>
  );
}

export { DiscardConfirmDialog, type DiscardConfirmDialogProps, type DiscardMessages };
