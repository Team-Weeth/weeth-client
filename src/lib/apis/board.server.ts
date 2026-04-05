import { apiServer } from '@/lib/apis/server';
import type { ApiResponse } from '@/types/common';
import type { Board, PostDetail } from '@/types/board';

export const boardServerApi = {
  /** 게시판 목록 조회 (RSC) — 거의 변하지 않으므로 30분 캐싱 */
  getBoards: (clubId: string) =>
    apiServer.get<ApiResponse<Board[]>>(`/clubs/${clubId}/boards`, {
      next: { revalidate: 1800, tags: ['boards'] },
    }),

  /** 게시글 상세 조회 (RSC)*/
  getPostById: (clubId: string, postId: number) =>
    apiServer.get<ApiResponse<PostDetail>>(`/clubs/${clubId}/boards/posts/${postId}`, {
      cache: 'no-store',
    }),

  /** 공지 읽음 처리 (Server Action) */
  readAllNotices: (clubId: string, boardId: number) =>
    apiServer.post<ApiResponse<void>>(`/clubs/${clubId}/boards/${boardId}/notices/read-all`),
};
