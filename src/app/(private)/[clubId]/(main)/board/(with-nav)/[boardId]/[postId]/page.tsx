import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { boardServerApi } from '@/lib/apis/board.server';
import { PostDetailContent } from './PostDetailContent';

interface PostDetailPageProps {
  params: Promise<{ clubId: string; boardId: string; postId: string }>;
}

export async function generateMetadata({
  params,
}: PostDetailPageProps): Promise<Metadata> {
  const { clubId, boardId, postId } = await params;
  const boardIdNum = Number(boardId);
  const postIdNum = Number(postId);
  if (!Number.isInteger(boardIdNum) || !Number.isInteger(postIdNum))
    return { title: '게시글' };

  try {
    const response = await boardServerApi.getPostById(
      clubId,
      boardIdNum,
      postIdNum,
    );
    if (response?.data) return { title: response.data.title };
  } catch {
    // fall through to default
  }
  return { title: '게시글' };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { clubId, boardId, postId } = await params;
  const boardIdNum = Number(boardId);
  const postIdNum = Number(postId);
  if (!Number.isInteger(boardIdNum) || !Number.isInteger(postIdNum)) notFound();

  const response = await boardServerApi
    .getPostById(clubId, boardIdNum, postIdNum)
    .catch((error) => {
      if (error?.response?.status === 404) return null;
      throw error;
    });
  if (!response?.data) notFound();

  return <PostDetailContent initialData={response.data} />;
}
