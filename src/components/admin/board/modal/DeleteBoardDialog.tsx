'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel } from '@/components/ui';

interface DeleteBoardDialogProps {
  name: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  trigger?: React.ReactElement;
}

function DeleteBoardDialog({
  name,
  open,
  onOpenChange,
  onConfirm,
  trigger,
}: DeleteBoardDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`'${name}'을 삭제하시겠어요?`}
      description="게시판을 삭제해도 휴지통에 30일간 보관됩니다."
      status="danger"
      trigger={trigger}
    >
      <AlertDialogAction onClick={onConfirm}>삭제</AlertDialogAction>
      <AlertDialogCancel>취소</AlertDialogCancel>
    </AlertDialog>
  );
}

export { DeleteBoardDialog, type DeleteBoardDialogProps };
