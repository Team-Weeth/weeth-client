import { apiClient } from '@/lib/apis/client';
import type {
  HomeDashboardResponse,
  UnreadNotice,
  RecentNotice,
  MonthlySchedule,
  RecentPost,
  PageData,
  ProfileStatus,
} from '@/types/home';
import type { ApiResponse } from '@/types/common';

export const homeApi = {
  getDashboard: (clubId: string) =>
    apiClient.get<HomeDashboardResponse>(`/api/v4/clubs/${clubId}/dashboard/home`),

  getUnreadNotice: (clubId: string) =>
    apiClient.get<ApiResponse<UnreadNotice | null>>(
      `/api/v4/clubs/${clubId}/dashboard/unread-notice`,
    ),

  getRecentNotices: (clubId: string, params?: { size?: number }) =>
    apiClient.get<ApiResponse<RecentNotice[]>>(`/api/v4/clubs/${clubId}/dashboard/recent-notices`, {
      params,
    }),

  getMonthlySchedules: (clubId: string) =>
    apiClient.get<ApiResponse<MonthlySchedule[]>>(
      `/api/v4/clubs/${clubId}/dashboard/monthly-schedules`,
    ),

  getRecentPosts: (clubId: string, params?: { pageNumber?: number; pageSize?: number }) =>
    apiClient.get<ApiResponse<PageData<RecentPost>>>(
      `/api/v4/clubs/${clubId}/dashboard/recent-posts`,
      { params },
    ),

  getProfileStatus: (clubId: string) =>
    apiClient.get<ApiResponse<ProfileStatus>>(`/api/v4/clubs/${clubId}/members/me/profile-status`),
};
