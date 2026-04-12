import { cookies } from 'next/headers';

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
  const response = await boardServerApi.getPostById(clubId, Number(id));

  return <PostDetailContent post={response.data} />;
}
