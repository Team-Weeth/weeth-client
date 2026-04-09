import type { ApiResponse } from '@/types/common';
import type { Club } from '@/types';

import { apiClient } from './client';

export const clubApi = {
  getById: (clubId: string) => apiClient.get<ApiResponse<Club>>(`/clubs/${clubId}`),
  join: (clubId: string, code: string) =>
    apiClient.post<ApiResponse<void>>(`/clubs/${clubId}/join`, { code }),
};
