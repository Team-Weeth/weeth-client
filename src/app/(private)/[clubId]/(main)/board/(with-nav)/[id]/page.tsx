import { notFound } from 'next/navigation';

import { boardServerApi } from '@/lib/apis/board.server';
import { PostDetailContent } from './PostDetailContent';

interface PostDetailPageProps {
  params: Promise<{ clubId: string; id: string }>;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { clubId, id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) notFound();

  const response = await boardServerApi.getPostById(clubId, postId).catch((error) => {
    if (error?.response?.status === 404) return null;
    throw error;
  });
  if (!response?.data) notFound();

  return <PostDetailContent initialData={response.data} />;
}
