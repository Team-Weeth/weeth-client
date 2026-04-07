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

  useEffect(() => {
    reset();
    if (activeBoardId !== null) {
      setBoard(activeBoardId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 마운트 시 1회만 실행
  }, []);

  const activeId = board ?? activeBoardId ?? items.find((item) => item.type !== 'ALL')?.id ?? null;

  return (
    <PostEditorShell
      align="center"
      header={<CategorySelector items={items} activeId={activeId} onItemSelect={setBoard} />}
    />
  );
}
