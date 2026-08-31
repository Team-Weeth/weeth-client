'use client';

import type React from 'react';

import { AlertDialog, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';

interface CommentDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
}

function CommentDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: CommentDeleteDialogProps) {
  const handleConfirm = (event: React.MouseEvent) => {
    event.preventDefault();
    onConfirm();
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
      status="danger"
      title="이 댓글을 삭제하시겠어요?"
      description="삭제된 댓글은 복구할 수 없어요."
    >
      <AlertDialogAction disabled={isPending} onClick={handleConfirm} className="text-text-inverse">
        삭제
      </AlertDialogAction>
      <AlertDialogCancel disabled={isPending}>취소</AlertDialogCancel>
    </AlertDialog>
  );
}

export { CommentDeleteDialog, type CommentDeleteDialogProps };
