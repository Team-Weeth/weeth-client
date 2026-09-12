import { apiClient } from '@/lib/apis/client';
import type { ApiResponse, PageResponse } from '@/types/common';
import type {
  ClubMemberDetail,
  ClubMemberListItem,
  MemberListParams,
  MemberPostListItem,
} from '@/types/member';

export const memberApi = {
  getMembers: (clubId: string, params?: MemberListParams) =>
    apiClient.get<ApiResponse<PageResponse<ClubMemberListItem>>>(`/clubs/${clubId}/members`, {
      params,
    }),
  getMemberDetail: (clubId: string, clubMemberId: number) =>
    apiClient.get<ApiResponse<ClubMemberDetail>>(`/clubs/${clubId}/members/${clubMemberId}`),
  getMemberPosts: (
    clubId: string,
    clubMemberId: number,
    params?: { pageNumber?: number; pageSize?: number },
  ) =>
    apiClient.get<ApiResponse<PageResponse<MemberPostListItem>>>(
      `/clubs/${clubId}/members/${clubMemberId}/posts`,
      { params },
    ),
};
