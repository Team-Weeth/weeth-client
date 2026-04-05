'use server';

import { revalidatePath } from 'next/cache';
import { boardServerApi } from '@/lib/apis/board.server';
import type { CreatePostBody, UpdatePostBody } from '@/types/board';

export async function readAllNotices(clubId: string, boardId: number) {
  await boardServerApi.readAllNotices(clubId, boardId);
  revalidatePath('/board', 'layout');
}

export async function createPost(clubId: string, boardId: number, body: CreatePostBody) {
  const response = await boardServerApi.createPost(clubId, boardId, body);
  revalidatePath('/board', 'layout');
  return response.data;
}

export async function updatePost(clubId: string, postId: number, body: UpdatePostBody) {
  const response = await boardServerApi.updatePost(clubId, postId, body);
  revalidatePath('/board', 'layout');
  revalidatePath(`/board/${postId}`);
  return response.data;
}

export async function deletePost(clubId: string, postId: number) {
  await boardServerApi.deletePost(clubId, postId);
  revalidatePath('/board', 'layout');
}
