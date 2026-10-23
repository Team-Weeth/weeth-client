import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { boardServerApi } from '@/lib/apis/board.server';
import { BoardContent } from '@/components/board/BoardContent';

interface BoardByIdPageProps {
  params: Promise<{ clubId: string; boardId: string }>;
}

export async function generateMetadata({
  params,
}: BoardByIdPageProps): Promise<Metadata> {
  const { clubId, boardId } = await params;
  const boardIdNum = Number(boardId);
  if (!boardId || !Number.isInteger(boardIdNum)) return { title: '게시판' };

  try {
    const response = await boardServerApi.getBoards(clubId);
    const board = response.data?.find((b) => b.id === boardIdNum);
    if (board) return { title: board.name };
  } catch {
    // fall through to default
  }
  return { title: '게시판' };
}

export default async function BoardByIdPage({ params }: BoardByIdPageProps) {
  const { clubId, boardId } = await params;
  const boardIdNum = Number(boardId);
  if (!boardId || !Number.isInteger(boardIdNum)) notFound();

  const response = await boardServerApi.getBoards(clubId).catch(() => null);
  if (!response) notFound();

  const board = response.data?.find((b) => b.id === boardIdNum);
  if (!board || board.boardConfig?.canRead === false) notFound();

  return <BoardContent boardId={boardIdNum} />;
}
