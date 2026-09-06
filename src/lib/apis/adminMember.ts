import { apiClient } from '@/lib/apis/client';
import type { ClubMember, ClubMemberRole } from '@/types/admin/member';
import type { ApiResponse, PageResponse } from '@/types/common';

/** 멤버 목록 정렬 (백엔드가 지원하는 값) */
export type ClubMemberSort = 'CARDINAL_DESC' | 'CARDINAL_ASC' | 'NAME_ASC' | 'JOINED_DESC';

export interface ClubMemberListParams {
  page?: number;
  size?: number;
  keyword?: string;
  cardinalNumber?: number;
  sort?: ClubMemberSort;
}

export const adminMemberApi = {
  getMembers: (clubId: string, params?: ClubMemberListParams) =>
    apiClient.get<ApiResponse<PageResponse<ClubMember>>>(`/admin/clubs/${clubId}/members`, {
      params,
    }),
  updateMemberRole: (clubId: string, clubMemberId: number, memberRole: ClubMemberRole) =>
    apiClient.patch(`/admin/clubs/${clubId}/members/${clubMemberId}/role`, { memberRole }),
  banMember: (clubId: string, clubMemberId: number) =>
    apiClient.delete(`/admin/clubs/${clubId}/members/${clubMemberId}/ban`),
  restoreMember: (clubId: string, clubMemberId: number) =>
    apiClient.patch(`/admin/clubs/${clubId}/members/${clubMemberId}/restore`),
  transferLead: (clubId: string, targetClubMemberId: number) =>
    apiClient.patch(`/admin/clubs/${clubId}/members/${targetClubMemberId}/lead`),
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
