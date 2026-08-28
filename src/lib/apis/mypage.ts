import { apiClient } from '@/lib/apis/client';
import type {
  ClubDto,
  MyPageAssignableClub,
  MyClubMemberSummary,
  MyPageAttendedSessionItem,
  MyPagePenaltyItem,
  MyPagePostItem,
  MyPageSummary,
} from '@/types/mypage';
import type { ApiResponse, PageResponse } from '@/types/common';

export interface MyPageImagePayload {
  fileName: string;
  storageKey: string;
  fileSize: number;
  contentType: string;
}

export interface UpdateUserBody {
  name: string;
  email: string;
  studentId: string;
  tel: string;
  school: string;
  department: string;
}

export interface UpdateClubProfileBody {
  profileImage?: MyPageImagePayload | null;
  bio: string;
}

export interface CreateMultiProfileBody {
  name: string;
  profileImage?: MyPageImagePayload;
  headerImage?: MyPageImagePayload;
  bio: string;
  clubIds: string[];
}

export interface UpdateMultiProfileBody {
  name: string;
  profileImage?: MyPageImagePayload;
  headerImage?: MyPageImagePayload;
  bio: string;
}

export interface UpdateClubProfileAssignmentBody {
  assignments: Array<{
    clubId: string;
    profileId: number;
  }>;
}

export interface MultiProfileClub {
  clubId: string;
  name: string;
}

export interface MultiProfileResponse {
  profileId: number;
  name: string;
  profileImageUrl: string | null;
  headerImageUrl: string | null;
  bio: string | null;
  usingClubs: MultiProfileClub[];
}

export const mypageApi = {
  getMyPageSummary: (clubId: string) =>
    apiClient.get<ApiResponse<MyPageSummary>>(`/clubs/${clubId}/users/me/mypage`),
  getMyProfiles: () =>
    apiClient.get<ApiResponse<{ profiles: MultiProfileResponse[] }>>('/users/me/profiles'),
  getMyProfileDetail: (profileId: number) =>
    apiClient.get<ApiResponse<MultiProfileResponse>>(`/users/me/profiles/${profileId}`),
  getMyPosts: (clubId: string, params?: { pageNumber?: number; pageSize?: number }) =>
    apiClient.get<ApiResponse<PageResponse<MyPagePostItem>>>(
      `/clubs/${clubId}/users/me/mypage/posts`,
      { params },
    ),
  getMyAttendedSessions: (clubId: string, params?: { pageNumber?: number; pageSize?: number }) =>
    apiClient.get<ApiResponse<PageResponse<MyPageAttendedSessionItem>>>(
      `/clubs/${clubId}/users/me/mypage/attended-sessions`,
      { params },
    ),
  getMyPenalties: (clubId: string, params?: { pageNumber?: number; pageSize?: number }) =>
    apiClient.get<ApiResponse<PageResponse<MyPagePenaltyItem>>>(
      `/clubs/${clubId}/users/me/mypage/penalties`,
      { params },
    ),
  getPenaltyRule: (clubId: string) =>
    apiClient.get<ApiResponse<{ content: string }>>(
      `/clubs/${clubId}/users/me/mypage/penalty-rule`,
    ),
  getMyClubMemberSummary: (clubId: string) =>
    apiClient.get<ApiResponse<MyClubMemberSummary>>(`/clubs/${clubId}/members/me/summary`),
  getAssignableClubs: () =>
    apiClient.get<ApiResponse<{ clubs: MyPageAssignableClub[] }>>(
      '/users/me/profiles/assignable-clubs',
    ),
  getMyClubs: () => apiClient.get<ApiResponse<ClubDto[]>>('/clubs'),
  updateUser: (body: UpdateUserBody) => apiClient.patch('/users', body),
  updateClubProfile: (body: UpdateClubProfileBody) => apiClient.patch('/clubs/members/me', body),
  deleteProfileImage: () => apiClient.delete('/clubs/members/me/profile-image'),
  createMultiProfile: (body: CreateMultiProfileBody) =>
    apiClient.post<ApiResponse<MultiProfileResponse>>('/users/me/profiles', body),
  updateMultiProfile: (profileId: number, body: UpdateMultiProfileBody) =>
    apiClient.patch<ApiResponse<MultiProfileResponse>>(`/users/me/profiles/${profileId}`, body),
  deleteMultiProfileProfileImage: (profileId: number) =>
    apiClient.delete<ApiResponse<string>>(`/users/me/profiles/${profileId}/profile-image`),
  deleteMultiProfileHeaderImage: (profileId: number) =>
    apiClient.delete<ApiResponse<string>>(`/users/me/profiles/${profileId}/header-image`),
  updateClubProfileAssignments: (body: UpdateClubProfileAssignmentBody) =>
    apiClient.patch<ApiResponse<string>>('/users/me/club-profile-assignments', body),
  leaveClub: (clubId: string) => apiClient.delete<ApiResponse<string>>(`/clubs/${clubId}/leave`),
  deleteMultiProfile: (profileId: number) =>
    apiClient.delete<ApiResponse<string>>(`/users/me/profiles/${profileId}`),
  initCardinals: (clubId: string, cardinals: number[]) =>
    apiClient.post(`/clubs/${clubId}/members/me/cardinals`, { cardinals }),
};
