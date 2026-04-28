import { notFound } from 'next/navigation';

import { boardServerApi } from '@/lib/apis/board.server';
import { EditClientEditor } from './EditClientEditor';

interface PostEditPageProps {
  params: Promise<{ clubId: string; id: string }>;
  searchParams: Promise<{ boardId?: string }>;
}

const isValidId = (value?: string): value is string =>
  typeof value === 'string' && /^\d+$/.test(value);

export default async function PostEditPage({ params, searchParams }: PostEditPageProps) {
  const { clubId, id } = await params;
  const { boardId: boardIdParam } = await searchParams;

  if (!isValidId(id) || !isValidId(boardIdParam)) {
    notFound();
  }

  const postId = parseInt(id, 10);
  const boardId = parseInt(boardIdParam, 10);

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
