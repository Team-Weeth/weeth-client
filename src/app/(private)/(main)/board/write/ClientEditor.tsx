'use client';

import dynamic from 'next/dynamic';
import { TitleInput, CategorySelector } from '@/components/board';
import { useBoardList } from '@/hooks';
import { usePostStore } from '@/stores/usePostStore';
import type { BoardNavItem } from '@/components/board';

const Editor = dynamic(() => import('@/components/board/Editor'), { ssr: false });

function toBoardNavItem(board: { id: number; name: string; type: 'ALL' | 'NOTICE' | 'GENERAL' }): BoardNavItem {
  return { id: board.id, label: board.name, type: board.type };
}

export default function ClientEditor() {
  const { data: boards } = useBoardList();
  const items = boards?.map(toBoardNavItem) ?? [];

  const board = usePostStore((s) => s.board);
  const setBoard = usePostStore((s) => s.setBoard);

  const activeId = board ?? items.find((item) => item.type === 'ALL')?.id ?? items[0]?.id ?? 0;

  return (
    <div className="mx-auto flex max-w-[1200px] flex-1 flex-col items-center gap-400 p-450">
      <CategorySelector items={items} activeId={activeId} onItemSelect={setBoard} />
      <div className="flex w-full flex-col items-start">
        <TitleInput />
        <div className="flex w-full items-center gap-200 rounded-lg p-100">
          <Editor />
        </div>
      </div>
    </div>
  );
}
