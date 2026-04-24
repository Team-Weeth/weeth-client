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
  type: AdminBoardType;
  commentEnabled: boolean;
  writePermission: AdminBoardWritePermission;
  isPrivate: boolean;
}

export interface UpdateBoardBody {
  name: string;
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

  deleteBoard: (clubId: string, boardId: number) =>
    apiClient.delete<ApiResponse<void>>(`/admin/clubs/${clubId}/boards/${boardId}`),
};
