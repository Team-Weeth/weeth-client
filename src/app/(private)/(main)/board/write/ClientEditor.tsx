'use client';

import { useEffect } from 'react';

import { CategorySelector, PostEditorShell } from '@/components/board';
import { useBoardList } from '@/hooks';
import { toBoardNavItem } from '@/lib/board';
import { usePostStore } from '@/stores/usePostStore';
import { useActiveBoardId } from '@/stores/useBoardNavStore';

export default function ClientEditor() {
  const { data: boards } = useBoardList();
  const items = boards?.map(toBoardNavItem) ?? [];
  const activeBoardId = useActiveBoardId();

  const board = usePostStore((s) => s.board);
  const setBoard = usePostStore((s) => s.setBoard);
  const reset = usePostStore((s) => s.reset);

  // 글쓰기 페이지 진입 시 store 초기화 후 현재 게시판으로 설정
  useEffect(() => {
    reset();
    if (activeBoardId !== null) {
      setBoard(activeBoardId);
    }
  }, []);

  const activeId = board ?? activeBoardId ?? items.find((item) => item.type !== 'ALL')?.id ?? null;

  return (
    <PostEditorShell
      align="center"
      header={<CategorySelector items={items} activeId={activeId} onItemSelect={setBoard} />}
    />
  );
}
