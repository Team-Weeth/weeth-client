import type { ReactNode } from 'react';
import { boardServerApi } from '@/lib/apis/board.server';
import { toBoardNavItem } from '@/lib/board';
import { BOARD_TYPE_ORDER } from '@/constants/board/type';
import { BoardNavClient } from './BoardNavClient';

interface BoardLayoutProps {
  children: ReactNode;
  footer: ReactNode;
  params: Promise<{ clubId: string }>;
}

export default async function BoardLayout({ children, footer, params }: BoardLayoutProps) {
  const { clubId } = await params;
  const response = await boardServerApi.getBoards(clubId).catch(() => null);
  const boards = [...(response?.data ?? [])].sort(
    (a, b) => (BOARD_TYPE_ORDER[a.type] ?? 99) - (BOARD_TYPE_ORDER[b.type] ?? 99),
  );
  const items = boards.map(toBoardNavItem);

  return (
    <div className="flex items-start gap-700 px-[64px] pt-450 pb-[63px]">
      <aside className="flex shrink-0 flex-col gap-400">
        <BoardNavClient items={items} />
        {footer}
      </aside>
      {children}
    </div>
  );
}
