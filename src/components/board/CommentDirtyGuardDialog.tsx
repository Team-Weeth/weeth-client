import { useRef } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';

interface CommentDirtyGuardDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function CommentDirtyGuardDialog({ open, onConfirm, onCancel }: CommentDirtyGuardDialogProps) {
  const confirmingRef = useRef(false);

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          if (confirmingRef.current) {
            confirmingRef.current = false;
            return;
          }
          onCancel();
        }
      }}
      title="작성 중인 댓글이 있어요"
      description="저장하지 않고 이동하면 작성한 내용이 사라져요."
    >
      <AlertDialogAction
        onClick={() => {
          confirmingRef.current = true;
          onConfirm();
        }}
      >
        이동
      </AlertDialogAction>
      <AlertDialogCancel>취소</AlertDialogCancel>
    </AlertDialog>
  );
}

export { CommentDirtyGuardDialog, type CommentDirtyGuardDialogProps };
