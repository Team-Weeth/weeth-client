import { notFound } from 'next/navigation';

import { boardServerApi } from '@/lib/apis/board.server';
import { PostDetailContent } from './PostDetailContent';

interface PostDetailPageProps {
  params: Promise<{ clubId: string; boardId: string; postId: string }>;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { clubId, postId } = await params;
  const postIdNum = Number(postId);
  if (!Number.isInteger(postIdNum)) notFound();

  const response = await boardServerApi.getPostById(clubId, postIdNum).catch((error) => {
    if (error?.response?.status === 404) return null;
    throw error;
  });
  if (!response?.data) notFound();

  return <PostDetailContent initialData={response.data} />;
}
