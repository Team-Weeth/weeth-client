import { apiClient } from '@/lib/apis/client';
import { API_BASE_PATH } from '@/constants/api';
import type { ApiResponse } from '@/types/common';

export type OwnerType =
  | 'POST'
  | 'COMMENT'
  | 'RECEIPT'
  | 'CLUB_MEMBER_PROFILE'
  | 'CLUB_PROFILE'
  | 'CLUB_BACKGROUND';

export interface PresignedUrl {
  fileName: string;
  putUrl: string;
  storageKey: string;
}

export const fileApi = {
  /** presigned URL 요청 */
  getPresignedUrls: (ownerType: OwnerType, fileNames: string[]) =>
    apiClient.get<ApiResponse<PresignedUrl[]>>(`${API_BASE_PATH}/files`, {
      params: { ownerType, fileNames },
    }),
};
