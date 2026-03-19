'use client';

import dynamic from 'next/dynamic';
import { TitleInput, CategorySelector } from '@/components/board';
import type { BoardNavItem } from '@/components/board';
import { usePostStore } from '@/stores/usePostStore';

const Editor = dynamic(() => import('@/components/board/Editor'), { ssr: false });

const MOCK_ITEMS: BoardNavItem[] = [
  { id: 'notice', label: '공지', type: 'notice' },
  { id: 'all', label: '전체', type: 'channel' },
  { id: 'study-fe', label: '[스터디 게시판] FE', type: 'channel' },
  { id: 'study-be', label: '[스터디 게시판] BE', type: 'channel' },
];

export default function ClientEditor() {
  const board = usePostStore((s) => s.board) || 'all';
  const setBoard = usePostStore((s) => s.setBoard);

  return (
    <div className="mx-auto flex max-w-[1200px] flex-1 flex-col items-center gap-400 p-450">
      <CategorySelector
        items={MOCK_ITEMS}
        activeId={board}
        onItemSelect={setBoard}
      />
      <div className="flex w-full flex-col items-start">
        <TitleInput />
        <div className="flex w-full items-center gap-200 rounded-lg p-100">
          <Editor />
        </div>
      </div>
    </div>
  );
}
