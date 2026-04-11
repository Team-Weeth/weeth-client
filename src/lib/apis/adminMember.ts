import { apiClient } from '@/lib/apis/client';
import type { ClubMember, ClubMemberRole } from '@/types/admin/member';
import type { ApiResponse } from '@/types/common';

export const adminMemberApi = {
  getMembers: (clubId: string) =>
    apiClient.get<ApiResponse<ClubMember[]>>(`/admin/clubs/${clubId}/members`),
  updateMemberRole: (clubId: string, clubMemberId: number, memberRole: ClubMemberRole) =>
    apiClient.patch(`/admin/clubs/${clubId}/members/${clubMemberId}/role`, { memberRole }),
  banMember: (clubId: string, clubMemberId: number) =>
    apiClient.delete(`/admin/clubs/${clubId}/members/${clubMemberId}/ban`),
  restoreMember: (clubId: string, clubMemberId: number) =>
    apiClient.patch(`/admin/clubs/${clubId}/members/${clubMemberId}/restore`),
  updateMemberCardinals: (
    clubId: string,
    clubMemberId: number,
    body: { cardinalIds: number[]; force?: boolean },
  ) =>
    apiClient.patch(`/admin/clubs/${clubId}/members/${clubMemberId}/cardinals`, {
      cardinalIds: body.cardinalIds,
      force: body.force ?? false,
    }),
};
