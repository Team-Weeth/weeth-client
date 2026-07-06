'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel } from '@/components/ui';

interface WithdrawConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: () => void;
}

function WithdrawConfirmDialog({ open, onOpenChange, onConfirm }: WithdrawConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange(false);
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
      status="danger"
      title={'서비스를 탈퇴하면\n모든 활동 기록이 사라져요'}
      description={'가입한 동아리와 게시글이 모두 삭제돼요.\n버튼 클릭 시 바로 탈퇴돼요.'}
    >
      <AlertDialogAction onClick={handleConfirm}>탈퇴하기</AlertDialogAction>
      <AlertDialogCancel>취소</AlertDialogCancel>
    </AlertDialog>
  );
}

export { WithdrawConfirmDialog, type WithdrawConfirmDialogProps };
