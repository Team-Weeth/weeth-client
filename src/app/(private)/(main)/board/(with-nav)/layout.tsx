'use client';

import type { ReactNode } from 'react';
import { BoardNav, BoardNavSkeleton } from '@/components/board';
import { useBoardList } from '@/hooks';
import { useActiveBoardId, useSetActiveBoardId } from '@/stores/useBoardNavStore';
import type { BoardNavItem } from '@/components/board';

function toBoardNavItem(board: { id: number | null; name: string; type: 'ALL' | 'NOTICE' | 'GENERAL' }): BoardNavItem {
  return { id: board.id, label: board.name, type: board.type };
}

interface BoardLayoutProps {
  children: ReactNode;
  footer: ReactNode;
}

export default function BoardLayout({ children, footer }: BoardLayoutProps) {
  const { data: boards, isLoading } = useBoardList();
  const items = boards?.map(toBoardNavItem) ?? [];

  const activeBoardId = useActiveBoardId();
  const setActiveBoardId = useSetActiveBoardId();

  // activeBoardId가 null(미선택)이면 ALL 게시판(id: null) 하이라이트
  const resolvedActiveId = activeBoardId;

  return (
    <div className="flex items-start gap-700 px-800 pt-450 pb-[63px]">
      <aside className="flex shrink-0 flex-col gap-400">
        {isLoading ? (
          <BoardNavSkeleton />
        ) : (
          <BoardNav
            items={items}
            activeId={resolvedActiveId}
            onItemSelect={setActiveBoardId}
          />
        )}
        {footer}
      </aside>
      {children}
    </div>
  );
}
