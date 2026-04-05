'use server';

import { revalidatePath } from 'next/cache';
import { boardServerApi } from '@/lib/apis/board.server';

export async function readAllNotices(clubId: string, boardId: number) {
  await boardServerApi.readAllNotices(clubId, boardId);
  revalidatePath('/board', 'layout');
}
