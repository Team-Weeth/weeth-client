import { apiClient } from '@/lib/apis/client';
import type { ClubMember, ClubMemberRole } from '@/types/admin/member';
import type { ApiResponse } from '@/types/common';

export const adminMemberApi = {
  getMembers: (clubId: string) =>
    apiClient.get<ApiResponse<ClubMember[]>>(`/api/v4/admin/clubs/${clubId}/members`),
  updateMemberRole: (clubId: string, clubMemberId: number, memberRole: ClubMemberRole) =>
    apiClient.patch(`/api/v4/admin/clubs/${clubId}/members/${clubMemberId}/role`, { memberRole }),
  banMember: (clubId: string, clubMemberId: number) =>
    apiClient.delete(`/api/v4/admin/clubs/${clubId}/members/${clubMemberId}/ban`),
};
