import { notFound } from 'next/navigation';

import { boardServerApi } from '@/lib/apis/board.server';
import { EditClientEditor } from './EditClientEditor';

interface PostEditPageProps {
  params: Promise<{ clubId: string; id: string }>;
}

export default async function PostEditPage({ params }: PostEditPageProps) {
  const { clubId, id } = await params;
  const postId = Number(id);

  if (Number.isNaN(postId)) {
    notFound();
  }

  const response = await boardServerApi.getPostById(clubId, postId).catch(() => null);

  if (!response?.data) {
    notFound();
  }

  return (
    <main className="w-full">
      <EditClientEditor post={response.data} />
    </main>
  );
}
