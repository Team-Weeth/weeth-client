'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';

import { TitleInput, CategorySelector } from '@/components/board';
import { useBoardList } from '@/hooks';
import { toBoardNavItem } from '@/lib/board';
import { usePostStore } from '@/stores/usePostStore';
import { useActiveBoardId } from '@/stores/useBoardNavStore';

const Editor = dynamic(() => import('@/components/board/Editor'), { ssr: false });

export default function ClientEditor() {
  const { data: boards } = useBoardList();
  const items = boards?.map(toBoardNavItem) ?? [];
  const activeBoardId = useActiveBoardId();

  const board = usePostStore((s) => s.board);
  const setBoard = usePostStore((s) => s.setBoard);
  const reset = usePostStore((s) => s.reset);
  const title = usePostStore((s) => s.title);
  const setTitle = usePostStore((s) => s.setTitle);

  // 글쓰기 페이지 진입 시 store 초기화 후 현재 게시판으로 설정
  useEffect(() => {
    reset();
    if (activeBoardId !== null) {
      setBoard(activeBoardId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 마운트 시 1회만 실행
  }, []);

  const activeId = board ?? activeBoardId ?? items.find((item) => item.type !== 'ALL')?.id ?? null;

  return (
    <div className="mx-auto flex max-w-[1200px] flex-1 flex-col items-center gap-400 p-450">
      <CategorySelector items={items} activeId={activeId} onItemSelect={setBoard} />
      <div className="flex w-full flex-col items-start">
        <TitleInput value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="flex w-full items-center gap-200 rounded-lg p-100">
          <Editor />
        </div>
      </div>
    </div>
  );
}
