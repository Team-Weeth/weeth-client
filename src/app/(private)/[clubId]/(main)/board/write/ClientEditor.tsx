'use client';

import { useEffect, useLayoutEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CategorySelector, PostEditorShell } from '@/components/board';
import { useWritableBoards } from '@/hooks';
import { usePostStore } from '@/stores/usePostStore';
import { useActiveBoardId } from '@/stores/useBoardNavStore';
import { useClubId } from '@/stores/useClubStore';
import { toastError } from '@/stores/useToastStore';

export default function ClientEditor() {
  const router = useRouter();
  const clubId = useClubId();
  const { boards, writableItems } = useWritableBoards();
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

  useEffect(() => {
    if (boards && writableItems.length === 0) {
      toastError('작성 가능한 게시판이 없습니다. 관리자에게 문의하세요.');
      router.replace(`/${clubId}/board`);
    }
  }, [boards, writableItems.length, router, clubId]);

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
