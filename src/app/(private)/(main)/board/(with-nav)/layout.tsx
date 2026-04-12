import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { boardServerApi } from '@/lib/apis/board.server';
import { CLUB_ID_KEY } from '@/lib/apis/cookies';
import { toBoardNavItem } from '@/lib/board';
import { BOARD_TYPE_ORDER } from '@/constants/board/type';
import { BoardNavClient } from './BoardNavClient';

interface BoardLayoutProps {
  children: ReactNode;
  footer: ReactNode;
}

export default async function BoardLayout({ children, footer }: BoardLayoutProps) {
  const clubId = (await cookies()).get(CLUB_ID_KEY)?.value;
  if (!clubId) redirect('/hub');
  const response = await boardServerApi.getBoards(clubId);
  const boards = [...response.data].sort(
    (a, b) => (BOARD_TYPE_ORDER[a.type] ?? 99) - (BOARD_TYPE_ORDER[b.type] ?? 99),
  );
  const items = boards.map(toBoardNavItem);

  return (
    <div className="flex items-start gap-700 px-800 pt-450 pb-[63px]">
      <aside className="flex shrink-0 flex-col gap-400">
        <BoardNavClient items={items} />
        {footer}
      </aside>
      {children}
    </div>
  );
}
