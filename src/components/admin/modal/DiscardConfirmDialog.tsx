'use client';

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
}

function DiscardConfirmDialog({
  source,
  currentSource,
  placement,
  messages,
  onConfirm,
  onDismiss,
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
    />
  );
}

export { DiscardConfirmDialog, type DiscardConfirmDialogProps, type DiscardMessages };
