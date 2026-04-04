import { apiClient } from '@/lib/apis/client';
import type { ClubDto, MyMember } from '@/types/mypage';
import type { ApiResponse } from '@/types/common';

export interface UpdateUserBody {
  name: string;
  email: string;
  studentId: string;
  tel: string;
  school: string;
  department: string;
}

export interface UpdateClubProfileBody {
  profileImage?: {
    fileName: string;
    storageKey: string;
    fileSize: number;
    contentType: string;
  } | null;
  bio: string;
}

export const mypageApi = {
  getMe: (clubId: string) =>
    apiClient.get<ApiResponse<MyMember>>(`/clubs/${clubId}/members/me`),
  getMyClubs: () => apiClient.get<ApiResponse<ClubDto[]>>('/clubs'),
  updateUser: (body: UpdateUserBody) => apiClient.patch('/users', body),
  updateClubProfile: (body: UpdateClubProfileBody) =>
    apiClient.patch('/clubs/members/me', body),
};
