import { apiClient } from '@/lib/apis/client';
import type { ClubMember } from '@/types/admin/member';
import type { ApiResponse } from '@/types/common';

export const adminMemberApi = {
  getMembers: (clubId: string) =>
    apiClient.get<ApiResponse<ClubMember[]>>(`/api/v4/admin/clubs/${clubId}/members`),
};
