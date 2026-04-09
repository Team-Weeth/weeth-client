import { apiClient } from '@/lib/apis/client';
import type { Club } from '@/types/club';
import type { ApiResponse } from '@/types/common';

export const adminClubApi = {
  getDetail: (clubId: string) => apiClient.get<ApiResponse<Club>>(`/admin/clubs/${clubId}`),
};
