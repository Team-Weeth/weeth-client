import { apiClient } from '@/lib/apis/client';
import type { ClubPositionOption, SaveClubPositionOptionsBody } from '@/types/admin/memberPosition';
import type { ApiResponse } from '@/types/common';

export const adminPositionApi = {
  getOptions: (clubId: string) =>
    apiClient.get<ApiResponse<ClubPositionOption[]>>(`/admin/clubs/${clubId}/positions`),
  saveOptions: (clubId: string, body: SaveClubPositionOptionsBody) =>
    apiClient.put<ApiResponse<void>>(`/admin/clubs/${clubId}/positions`, body),
};
