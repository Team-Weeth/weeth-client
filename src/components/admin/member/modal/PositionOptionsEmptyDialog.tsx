'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';

interface PositionOptionsEmptyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoToSettings: () => void;
}

/** 동아리에 설정된 포지션 옵션이 없을 때 '부원 정보' 페이지로 안내한다. */
function PositionOptionsEmptyDialog({
  open,
  onOpenChange,
  onGoToSettings,
}: PositionOptionsEmptyDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
      title="변경 할 옵션이 없어요"
      description="'부원 정보' 페이지에서 옵션을 추가해주세요."
    >
      <AlertDialogAction onClick={onGoToSettings}>옵션 설정하러 가기</AlertDialogAction>
      <AlertDialogCancel>취소</AlertDialogCancel>
    </AlertDialog>
  );
}

export { PositionOptionsEmptyDialog, type PositionOptionsEmptyDialogProps };
