import { apiClient } from '@/lib/apis/client';
import type { ClubDto, MyMember } from '@/types/mypage';
import type { ApiResponse } from '@/types/common';

export const mypageApi = {
  getMe: (clubId: string) =>
    apiClient.get<ApiResponse<MyMember>>(`/clubs/${clubId}/members/me`),
  getMyClubs: () => apiClient.get<ApiResponse<ClubDto[]>>('/clubs'),
};
