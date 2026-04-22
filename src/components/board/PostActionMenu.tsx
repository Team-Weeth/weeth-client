'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ActionMenu, type ActionMenuProps } from './ActionMenu';
import { PostDeleteDialog } from './PostDeleteDialog';

interface PostActionMenuProps extends Omit<ActionMenuProps, 'onDeleteSelect'> {
  postId: number;
  onDeleted?: () => void;
}

function PostActionMenu({ postId, onDeleted, ...rest }: PostActionMenuProps) {
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleEdit = () => {
    router.push(`/${clubId}/board/edit/${postId}`);
  };

  const handleDeleteSelect = (event: Event) => {
    event.preventDefault();
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <ActionMenu {...rest} onEdit={handleEdit} onDeleteSelect={handleDeleteSelect} />

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
