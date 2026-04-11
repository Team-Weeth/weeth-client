import { apiClient } from '@/lib/apis/client';
import type { Cardinal, CreateCardinalBody } from '@/types/admin/cardinal';
import type { ApiResponse } from '@/types/common';

export const cardinalApi = {
  getCardinals: (clubId: string) =>
    apiClient.get<ApiResponse<Cardinal[]>>(`/clubs/${clubId}/cardinals`),
  createCardinal: (clubId: string, body: CreateCardinalBody) =>
    apiClient.post(`/api/v4/admin/clubs/${clubId}/cardinals`, body),
};
