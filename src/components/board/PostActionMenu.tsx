'use client';

import { useState } from 'react';
import { ActionMenu, type ActionMenuProps } from './ActionMenu';
import { PostDeleteDialog } from './PostDeleteDialog';

interface PostActionMenuProps extends Omit<ActionMenuProps, 'onDeleteSelect'> {
  postId: number;
  onDeleted?: () => void;
}

/**
 * 게시글 전용 수정/삭제 메뉴
 */
function PostActionMenu({ postId, onDeleted, ...rest }: PostActionMenuProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteSelect = (event: Event) => {
    event.preventDefault();
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <ActionMenu {...rest} onDeleteSelect={handleDeleteSelect} />

      {deleteDialogOpen ? (
        <PostDeleteDialog
          postId={postId}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onDeleted={onDeleted}
        />
      ) : null}
    </>
  );
}

export { PostActionMenu, type PostActionMenuProps };
