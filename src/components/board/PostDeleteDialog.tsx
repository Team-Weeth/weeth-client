'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel } from '@/components/ui';
import { useDeletePost } from '@/hooks';

interface PostDeleteDialogProps {
  postId: number;
  boardId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

/**
 * 게시글 삭제 확인 다이얼로그
 */
function PostDeleteDialog({
  postId,
  boardId,
  open,
  onOpenChange,
  onDeleted,
}: PostDeleteDialogProps) {
  const { deletePost, isPending } = useDeletePost();

  const handleConfirm = async (event: React.MouseEvent) => {
    event.preventDefault();
    await deletePost(boardId, postId, onDeleted);
    onOpenChange(false);
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
      status="danger"
      title={'이 게시글을 삭제하시겠어요?'}
      description={'삭제된 게시글은 복구할 수 없어요.'}
    >
      <AlertDialogAction disabled={isPending} onClick={handleConfirm} className="text-text-inverse">
        삭제
      </AlertDialogAction>
      <AlertDialogCancel disabled={isPending}>취소</AlertDialogCancel>
    </AlertDialog>
  );
}

export { PostDeleteDialog, type PostDeleteDialogProps };
