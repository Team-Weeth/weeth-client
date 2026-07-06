'use client';

import { useLogout } from '@/hooks';
import { AlertDialog, AlertDialogAction, AlertDialogCancel } from '@/components/ui';

interface LogoutConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function LogoutConfirmDialog({ open, onOpenChange }: LogoutConfirmDialogProps) {
  const handleLogout = useLogout();

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
      title="로그아웃"
      description="로그아웃 하시겠습니까?"
    >
      <AlertDialogAction onClick={handleLogout}>로그아웃</AlertDialogAction>
      <AlertDialogCancel>취소</AlertDialogCancel>
    </AlertDialog>
  );
}

export { LogoutConfirmDialog, type LogoutConfirmDialogProps };
