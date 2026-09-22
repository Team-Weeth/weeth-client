import { apiClient } from '@/lib/apis/client';
import type { ApiResponse } from '@/types/common';

export type OwnerType =
  | 'POST'
  | 'COMMENT'
  | 'ACCOUNT_TRANSACTION'
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
    apiClient.get<ApiResponse<PresignedUrl[]>>(`/files`, {
      params: { ownerType, fileNames },
      // 배열을 대괄호 없이 반복 키(fileNames=a&fileNames=b)로 직렬화 —
      // Spring @RequestParam List<String>가 기대하는 포맷. 기본값(fileNames[]=a)은 바인딩 실패.
      paramsSerializer: { indexes: null },
      // presigned URL 발급은 백엔드 처리 시간이 길 수 있으므로 전역 타임아웃보다 여유롭게 설정
      timeout: 30000,
    }),
};
