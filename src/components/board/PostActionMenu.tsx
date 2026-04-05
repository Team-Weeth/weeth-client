'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ActionMenu, type ActionMenuProps } from './ActionMenu';

const PostDeleteDialog = dynamic(() =>
  import('./PostDeleteDialog').then((mod) => mod.PostDeleteDialog),
);

interface PostActionMenuProps extends Omit<ActionMenuProps, 'onDeleteSelect'> {
  postId: number;
  onDeleted?: () => void;
}

/**
 * 게시글 전용 수정/삭제 메뉴
 *
 * 삭제 선택 시 확인 다이얼로그를 띄우고 내부에서 deletePost API를 호출
 * 댓글/답글 등 범용 용도에는 `ActionMenu`를 사용
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
