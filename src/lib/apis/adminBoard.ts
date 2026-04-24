import { apiClient } from '@/lib/apis/client';
import type { ApiResponse } from '@/types/common';

export type AdminBoardType = 'ALL' | 'NOTICE' | 'CUSTOM';
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

export const adminBoardApi = {
  getBoards: (clubId: string) =>
    apiClient.get<ApiResponse<AdminBoardDto[]>>(`/admin/clubs/${clubId}/boards`),
};
