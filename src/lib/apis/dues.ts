import { apiClient } from '@/lib/apis/client';
import type { ApiResponse } from '@/types/common';
import type { DuesDraftData, RegistrationStatus, SaveBasicBody } from '@/types/admin/dues';

export const duesApi = {
  createDraft: (clubId: string, cardinalNumber: number) =>
    apiClient.post<ApiResponse<DuesDraftData>>(
      `/admin/clubs/${clubId}/accounts/drafts`,
      null,
      { params: { cardinalNumber } },
    ),

  discardDraft: (clubId: string, accountId: number) =>
    apiClient.delete(`/admin/clubs/${clubId}/accounts/${accountId}/registration/draft`),

  getRegistrationStatus: (clubId: string, accountId: number) =>
    apiClient.get<ApiResponse<RegistrationStatus>>(
      `/admin/clubs/${clubId}/accounts/${accountId}/registration/status`,
    ),

  saveBasic: (clubId: string, accountId: number, body: SaveBasicBody) =>
    apiClient.patch(`/admin/clubs/${clubId}/accounts/${accountId}/registration/basic`, body),
};
