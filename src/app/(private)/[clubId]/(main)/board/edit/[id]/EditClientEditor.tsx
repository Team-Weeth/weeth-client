'use client';

import { useEffect, useRef } from 'react';

import { CategorySelector, PostEditorShell } from '@/components/board';
import { useBoardList } from '@/hooks';
import { toBoardNavItem } from '@/lib/board';
import { usePostStore } from '@/stores/usePostStore';
import type { PostDetail } from '@/types/board';

interface EditClientEditorProps {
  post: PostDetail;
}

function EditClientEditor({ post }: EditClientEditorProps) {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    usePostStore.getState().initFromDetail(post);
  }, [post]);

  const { data: boards } = useBoardList();
  const items = boards?.map(toBoardNavItem) ?? [];

  const board = usePostStore((s) => s.board);
  const setBoard = usePostStore((s) => s.setBoard);

  const activeId = board ?? post.boardId;

  return (
    <PostEditorShell
      align="center"
      initialContent={post.content}
      header={<CategorySelector items={items} activeId={activeId} onItemSelect={setBoard} />}
    />
  );
}

export { EditClientEditor };
