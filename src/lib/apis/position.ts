import { apiClient } from '@/lib/apis/client';
import type { ApiResponse } from '@/types/common';
import type { ClubMemberPosition } from '@/types/member';

export const positionApi = {
  getOptions: (clubId: string) =>
    apiClient.get<ApiResponse<ClubMemberPosition[]>>(`/clubs/${clubId}/positions`),
};
