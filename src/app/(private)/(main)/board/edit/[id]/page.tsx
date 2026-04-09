import { notFound } from 'next/navigation';

import { boardServerApi } from '@/lib/apis/board.server';
import { EditClientEditor } from './EditClientEditor';

interface PostEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostEditPage({ params }: PostEditPageProps) {
  const { id } = await params;
  const postId = Number(id);

  if (Number.isNaN(postId)) {
    notFound();
  }

  // TODO: 추후 하드코딩된 clubId 제거 예정
  const response = await boardServerApi.getPostById('YUNJcjFKMO', postId).catch(() => null);

  if (!response?.data) {
    notFound();
  }

  return (
    <main className="w-full">
      <EditClientEditor post={response.data} />
    </main>
  );
}
