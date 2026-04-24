import { BoardContent } from '@/components/board/BoardContent';

interface BoardByIdPageProps {
  params: Promise<{ boardId: string }>;
}

export default async function BoardByIdPage({ params }: BoardByIdPageProps) {
  const { boardId } = await params;
  const boardIdNum = Number(boardId);

  return <BoardContent boardId={Number.isInteger(boardIdNum) ? boardIdNum : null} />;
}
