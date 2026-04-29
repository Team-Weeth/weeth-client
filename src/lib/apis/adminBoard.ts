import type { AxiosError } from 'axios';

import { apiClient } from '@/lib/apis/client';
import type { ApiResponse } from '@/types/common';

export const ADMIN_BOARD_ERROR = {
  DUPLICATE_NAME: 20409,
  BOARD_LIMIT_EXCEEDED: 20415,
  BOARD_NOT_FOUND: 20403,
  PAGE_NOT_FOUND: 20401,
} as const;

export function getApiErrorCode(err: unknown): number | null {
  const axiosErr = err as AxiosError<{ code?: number }>;
  return axiosErr?.response?.data?.code ?? null;
}

export function getApiErrorMessage(err: unknown): string | undefined {
  const axiosErr = err as AxiosError<{ message?: string }>;
  return axiosErr?.response?.data?.message;
}

export type AdminBoardType = 'ALL' | 'NOTICE' | 'GALLERY' | 'INFORMATION' | 'GENERAL';
export type AdminBoardWritePermission = 'USER' | 'ADMIN';

export interface AdminBoardDto {
  id: number;
  name: string;
  description: string;
  type: AdminBoardType;
  commentEnabled: boolean;
  writePermission: AdminBoardWritePermission;
  isPrivate: boolean;
  displayOrder: number;
  postCount: number;
  isDeleted: boolean;
}

export interface CreateBoardBody {
  name: string;
  description: string;
  type: AdminBoardType;
  commentEnabled: boolean;
  writePermission: AdminBoardWritePermission;
  isPrivate: boolean;
}

export interface UpdateBoardBody {
  name: string;
  description: string;
  commentEnabled: boolean;
  writePermission: AdminBoardWritePermission;
  isPrivate: boolean;
}

/** 댓글 허용 토글 전용 body. 공지 게시판도 안전하게 PATCH 가능하도록 name 미포함 */
export interface UpdateBoardCommentBody {
  description: string;
  commentEnabled: boolean;
  writePermission: AdminBoardWritePermission;
  isPrivate: boolean;
}

export const adminBoardApi = {
  getBoards: (clubId: string) =>
    apiClient.get<ApiResponse<AdminBoardDto[]>>(`/admin/clubs/${clubId}/boards`),

  createBoard: (clubId: string, body: CreateBoardBody) =>
    apiClient.post<ApiResponse<AdminBoardDto>>(`/admin/clubs/${clubId}/boards`, body),

  updateBoard: (clubId: string, boardId: number, body: UpdateBoardBody) =>
    apiClient.patch<ApiResponse<AdminBoardDto>>(`/admin/clubs/${clubId}/boards/${boardId}`, body),

  updateBoardComment: (clubId: string, boardId: number, body: UpdateBoardCommentBody) =>
    apiClient.patch<ApiResponse<AdminBoardDto>>(`/admin/clubs/${clubId}/boards/${boardId}`, body),

  deleteBoard: (clubId: string, boardId: number) =>
    apiClient.delete<ApiResponse<void>>(`/admin/clubs/${clubId}/boards/${boardId}`),

  updateBoardOrder: (clubId: string, boardIds: number[]) =>
    apiClient.patch<ApiResponse<void>>(`/admin/clubs/${clubId}/boards/order`, { boardIds }),
};
