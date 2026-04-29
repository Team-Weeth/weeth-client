'use server';

import { revalidatePath } from 'next/cache';
import { boardServerApi } from '@/lib/apis/board.server';
import { ApiError } from '@/lib/apis/server';
import type { CreatePostBody, UpdatePostBody } from '@/types/board';

/** ApiError의 code를 클라이언트에서 파싱할 수 있도록 "[status:code] message" 형식으로 re-throw */
function rethrowWithCode(error: unknown): never {
  if (error instanceof ApiError) {
    throw new Error(`[${error.status}:${error.code}] ${error.message}`);
  }
  throw error;
}

export async function readAllNotices(clubId: string, boardId: number) {
  try {
    await boardServerApi.readAllNotices(clubId, boardId);
    revalidatePath(`/${clubId}/board`, 'layout');
  } catch (error) {
    rethrowWithCode(error);
  }
}

export async function createPost(clubId: string, boardId: number, body: CreatePostBody) {
  try {
    const response = await boardServerApi.createPost(clubId, boardId, body);
    revalidatePath(`/${clubId}/board`, 'layout');
    return response.data;
  } catch (error) {
    rethrowWithCode(error);
  }
}

export async function updatePost(
  clubId: string,
  boardId: number,
  postId: number,
  body: UpdatePostBody,
) {
  try {
    const response = await boardServerApi.updatePost(clubId, boardId, postId, body);
    revalidatePath(`/${clubId}/board`, 'layout');
    revalidatePath(`/${clubId}/board/${boardId}/${postId}`);
    return response.data;
  } catch (error) {
    rethrowWithCode(error);
  }
}

export async function deletePost(clubId: string, boardId: number, postId: number) {
  try {
    await boardServerApi.deletePost(clubId, boardId, postId);
    revalidatePath(`/${clubId}/board`, 'layout');
  } catch (error) {
    rethrowWithCode(error);
  }
}
