import { apiClient } from '@/lib/apis/client';
import type { Cardinal, CreateCardinalBody } from '@/types/admin/cardinal';
import type { ApiResponse } from '@/types/common';

export const cardinalApi = {
  getCardinals: (clubId: string) =>
    apiClient.get<ApiResponse<Cardinal[]>>(`/clubs/${clubId}/cardinals`),
  createCardinal: (clubId: string, body: CreateCardinalBody) =>
    apiClient.post(`/admin/clubs/${clubId}/cardinals`, body),
  setCurrentCardinal: (clubId: string, cardinalId: number) =>
    apiClient.patch(`/admin/clubs/${clubId}/cardinals/${cardinalId}`),
};
