'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel } from '@/components/ui';

interface DeleteProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}

function DeleteProfileDialog({ open, onOpenChange, onDelete }: DeleteProfileDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
      status="danger"
      title="이 프로필을 삭제하시겠어요?"
      description={'삭제된 프로필은 복구할 수 없습니다.\n신중히 확인 후 진행해 주세요.'}
    >
      <AlertDialogAction onClick={onDelete}>삭제</AlertDialogAction>
      <AlertDialogCancel>취소</AlertDialogCancel>
    </AlertDialog>
  );
}

export { DeleteProfileDialog, type DeleteProfileDialogProps };
