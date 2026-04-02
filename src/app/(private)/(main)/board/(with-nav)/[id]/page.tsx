import { boardServerApi } from '@/lib/apis/board.server';
import { PostDetailContent } from './PostDetailContent';

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  //TODO:"추후 하드코딩된 clubId 제거 예정
  const response = await boardServerApi.getPostById('YUNJcjFKMO', Number(id));

  return <PostDetailContent post={response.data} />;
}
