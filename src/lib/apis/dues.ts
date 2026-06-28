import { apiClient } from '@/lib/apis/client';
import type { ApiResponse } from '@/types/common';
import type { DuesDraftData } from '@/types/admin/dues';

export const duesApi = {
  createDraft: (clubId: string, cardinalNumber: number) =>
    apiClient.post<ApiResponse<DuesDraftData>>(
      `/admin/clubs/${clubId}/accounts/drafts`,
      null,
      { params: { cardinalNumber } },
    ),

  discardDraft: (clubId: string, accountId: number) =>
    apiClient.delete(`/admin/clubs/${clubId}/accounts/${accountId}/registration/draft`),
};
