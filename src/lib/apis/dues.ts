import { apiClient } from '@/lib/apis/client';
import type { ApiResponse } from '@/types/common';
import type { DuesCardinal, DuesMeResponse } from '@/types/dues';

export const duesApi = {
  getCardinals: (clubId: string) =>
    apiClient.get<ApiResponse<DuesCardinal[]>>(`/clubs/${clubId}/accounts/cardinals`),
  getMyDues: (clubId: string, cardinal: number) =>
    apiClient.get<ApiResponse<DuesMeResponse>>(`/clubs/${clubId}/accounts/${cardinal}/me`),
};
