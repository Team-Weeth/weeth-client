import { apiClient } from '@/lib/apis/client';
import type { ApiResponse } from '@/types/common';
import type { Board, PostDetail, PostLike, PostListItem, Slice } from '@/types/board';

export const boardApi = {
  /** 게시판 목록 조회 (React Query) */
  getBoards: (clubId: string) => apiClient.get<ApiResponse<Board[]>>(`/clubs/${clubId}/boards`),

  /** 전체 게시글 조회 (React Query) */
  getAllPosts: (clubId: string, params?: { pageNumber?: number; pageSize?: number }) =>
    apiClient.get<ApiResponse<Slice<PostListItem>>>(`/clubs/${clubId}/boards/posts`, {
      params,
    }),

  /** 게시판별 게시글 목록 조회 (React Query) */
  getPosts: (
    clubId: string,
    boardId: number,
    params?: { pageNumber?: number; pageSize?: number },
  ) =>
    apiClient.get<ApiResponse<Slice<PostListItem>>>(`/clubs/${clubId}/boards/${boardId}/posts`, {
      params,
    }),

  /** 게시글 상세 조회 (React Query) */
  getPostById: (clubId: string, postId: number) =>
    apiClient.get<ApiResponse<PostDetail>>(`/clubs/${clubId}/boards/posts/${postId}`),

  /** 공지 게시판 읽음 처리 */
  readAllNotices: (clubId: string, boardId: number) =>
    apiClient.post<ApiResponse<void>>(`/clubs/${clubId}/boards/${boardId}/notices/read-all`),

  /** 좋아요 토글 */
  toggleLike: (clubId: string, postId: number) =>
    apiClient.post<ApiResponse<PostLike>>(`/clubs/${clubId}/boards/posts/${postId}/like`),
};
