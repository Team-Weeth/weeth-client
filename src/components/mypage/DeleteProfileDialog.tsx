'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';

interface DeleteProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

function DeleteProfileDialog({
  open,
  onOpenChange,
  onDelete,
  isDeleting = false,
}: DeleteProfileDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
      status="danger"
      title="이 프로필을 삭제하시겠어요?"
      description={'삭제된 프로필은 복구할 수 없습니다.\n신중히 확인 후 진행해 주세요.'}
    >
      <AlertDialogAction
        disabled={isDeleting}
        onClick={() => {
          void onDelete();
        }}
      >
        {isDeleting ? '삭제 중...' : '삭제'}
      </AlertDialogAction>
      <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
    </AlertDialog>
  );
}

export { DeleteProfileDialog, type DeleteProfileDialogProps };
