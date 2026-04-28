'use client';

import { useEffect, useLayoutEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CategorySelector, PostEditorShell } from '@/components/board';
import { useBoardList } from '@/hooks';
import { toBoardNavItem } from '@/lib/board';
import { usePostStore } from '@/stores/usePostStore';
import { useActiveBoardId } from '@/stores/useBoardNavStore';

export default function ClientEditor() {
  const { data: boards } = useBoardList();
  const items = boards?.map(toBoardNavItem) ?? [];
  const writableItems = items.filter((item) => item.type !== 'ALL' && item.canWrite !== false);
  const activeBoardId = useActiveBoardId();

  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  const preferredByType =
    typeParam === 'NOTICE' || typeParam === 'GENERAL'
      ? (writableItems.find((item) => item.type === typeParam)?.id ?? null)
      : null;

  const board = usePostStore((s) => s.board);
  const setBoard = usePostStore((s) => s.setBoard);
  const reset = usePostStore((s) => s.reset);

  const isWritable = (id: number | null) =>
    id !== null && writableItems.some((item) => item.id === id);

  useLayoutEffect(() => {
    reset();
    if (preferredByType !== null) {
      setBoard(preferredByType);
    } else if (isWritable(activeBoardId)) {
      setBoard(activeBoardId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 마운트 시 1회만 실행
  }, []);

  const activeId = isWritable(board)
    ? board
    : preferredByType !== null
      ? preferredByType
      : isWritable(activeBoardId)
        ? activeBoardId
        : (writableItems[0]?.id ?? null);

  useEffect(() => {
    if (board !== activeId && activeId !== null) {
      setBoard(activeId);
    }
  }, [board, activeId, setBoard]);

  return (
    <PostEditorShell
      align="center"
      header={
        <CategorySelector items={writableItems} activeId={activeId} onItemSelect={setBoard} />
      }
    />
  );
}
