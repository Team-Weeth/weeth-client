import { Suspense, type ReactNode } from 'react';
import { boardServerApi } from '@/lib/apis/board.server';
import { toBoardNavItem } from '@/lib/board';
import { BOARD_TYPE_ORDER } from '@/constants/board/type';
import { BoardNavSkeleton } from '@/components/board/BoardNavSkeleton';
import { BoardNavClient } from './BoardNavClient';

interface BoardLayoutProps {
  children: ReactNode;
  footer: ReactNode;
  params: Promise<{ clubId: string }>;
}

async function BoardNavLoader({ clubId, footer }: { clubId: string; footer: ReactNode }) {
  const response = await boardServerApi.getBoards(clubId).catch(() => null);
  const boards = [...(response?.data ?? [])].sort(
    (a, b) => (BOARD_TYPE_ORDER[a.type] ?? 99) - (BOARD_TYPE_ORDER[b.type] ?? 99),
  );
  const items = boards.map(toBoardNavItem);

  return <BoardNavClient items={items} footer={footer} />;
}

export default async function BoardLayout({ children, footer, params }: BoardLayoutProps) {
  const { clubId } = await params;

  return (
    <div className="tablet:flex-row tablet:items-start desktop:px-[64px] flex flex-col gap-700 px-450 pt-450 pb-[63px]">
      <Suspense fallback={<BoardNavSkeleton />}>
        <BoardNavLoader clubId={clubId} footer={footer} />
      </Suspense>
      {children}
    </div>
  );
}
