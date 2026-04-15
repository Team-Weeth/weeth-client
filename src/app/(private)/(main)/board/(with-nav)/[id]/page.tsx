import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { boardServerApi } from '@/lib/apis/board.server';
import { CLUB_ID_KEY } from '@/lib/apis/cookies';
import { PostDetailContent } from './PostDetailContent';

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  const clubId = (await cookies()).get(CLUB_ID_KEY)?.value;
  if (!clubId) return null;
  const postId = Number(id);
  if (!Number.isInteger(postId)) notFound();

  const response = await boardServerApi.getPostById(clubId, postId).catch((error) => {
    if (error?.response?.status === 404) return null;
    throw error;
  });
  if (!response?.data) notFound();

  return <PostDetailContent initialData={response.data} />;
}
