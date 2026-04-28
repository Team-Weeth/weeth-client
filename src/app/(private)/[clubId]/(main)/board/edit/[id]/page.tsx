import { notFound } from 'next/navigation';

import { boardServerApi } from '@/lib/apis/board.server';
import { EditClientEditor } from './EditClientEditor';

interface PostEditPageProps {
  params: Promise<{ clubId: string; id: string }>;
  searchParams: Promise<{ boardId?: string }>;
}

export default async function PostEditPage({ params, searchParams }: PostEditPageProps) {
  const { clubId, id } = await params;
  const { boardId: boardIdParam } = await searchParams;
  const postId = Number(id);
  const boardId = Number(boardIdParam);

  if (!Number.isInteger(postId) || !Number.isInteger(boardId)) {
    notFound();
  }

  const response = await boardServerApi.getPostById(clubId, boardId, postId).catch(() => null);

  if (!response?.data) {
    notFound();
  }

  return (
    <main className="w-full">
      <EditClientEditor post={response.data} />
    </main>
  );
}
