'use client';

import { useEffect } from 'react';

import { CategorySelector, PostEditorShell } from '@/components/board';
import { useWritableBoards } from '@/hooks/board/useWritableBoards';
import { usePostStore } from '@/stores/usePostStore';
import type { PostDetail } from '@/types/board';

interface EditClientEditorProps {
  post: PostDetail;
}

function EditClientEditor({ post }: EditClientEditorProps) {
  useEffect(() => {
    usePostStore.getState().initFromDetail(post);
    return () => {
      usePostStore.getState().reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id]);

  const { writableItems } = useWritableBoards();

  const board = usePostStore((s) => s.board);
  const setBoard = usePostStore((s) => s.setBoard);

  const activeId = board ?? post.boardId;

  return (
    <PostEditorShell
      align="center"
      initialContent={post.content}
      header={
        <CategorySelector items={writableItems} activeId={activeId} onItemSelect={setBoard} />
      }
    />
  );
}

export { EditClientEditor };
