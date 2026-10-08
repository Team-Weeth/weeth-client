import { notFound } from 'next/navigation';

import { boardServerApi } from '@/lib/apis/board.server';
import { BoardContent } from '@/components/board/BoardContent';

interface BoardByIdPageProps {
  params: Promise<{ clubId: string; boardId: string }>;
}

export default async function BoardByIdPage({ params }: BoardByIdPageProps) {
  const { clubId, boardId } = await params;
  const boardIdNum = Number(boardId);
  if (!boardId || !Number.isInteger(boardIdNum)) notFound();

  const response = await boardServerApi.getBoards(clubId).catch(() => null);
  const board = response?.data?.find((b) => b.id === boardIdNum);
  if (board?.boardConfig?.canRead === false) notFound();

  return <BoardContent boardId={boardIdNum} />;
}
