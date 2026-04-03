'use server';

import { revalidatePath } from 'next/cache';
import { boardServerApi } from '@/lib/apis/board.server';
import type { CreatePostBody } from '@/types/board';

export async function readAllNotices(clubId: string, boardId: number) {
  await boardServerApi.readAllNotices(clubId, boardId);
  revalidatePath('/board', 'layout');
}

export async function createPost(clubId: string, boardId: number, body: CreatePostBody) {
  const response = await boardServerApi.createPost(clubId, boardId, body);
  revalidatePath('/board', 'layout');
  console.log('Post created:', response.data);
  return response.data;
}
