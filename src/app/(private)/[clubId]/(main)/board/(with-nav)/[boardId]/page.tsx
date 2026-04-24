import { notFound } from 'next/navigation';

import { BoardContent } from '@/components/board/BoardContent';

interface BoardByIdPageProps {
  params: Promise<{ boardId: string }>;
}

export default async function BoardByIdPage({ params }: BoardByIdPageProps) {
  const { boardId } = await params;
  const boardIdNum = Number(boardId);
  if (!boardId || !Number.isInteger(boardIdNum)) notFound();

  return <BoardContent boardId={boardIdNum} />;
}
