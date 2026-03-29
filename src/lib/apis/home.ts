import { apiClient } from '@/lib/apis/client';
import { API_BASE_PATH } from '@/constants/api';
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
    apiClient.get<HomeDashboardResponse>(`${API_BASE_PATH}/clubs/${clubId}/dashboard/home`),

  getUnreadNotice: (clubId: string) =>
    apiClient.get<ApiResponse<UnreadNotice | null>>(
      `${API_BASE_PATH}/clubs/${clubId}/dashboard/unread-notice`,
    ),

  getRecentNotices: (clubId: string, params?: { size?: number }) =>
    apiClient.get<ApiResponse<RecentNotice[]>>(
      `${API_BASE_PATH}/clubs/${clubId}/dashboard/recent-notices`,
      {
        params,
      },
    ),

  getMonthlySchedules: (clubId: string) =>
    apiClient.get<ApiResponse<MonthlySchedule[]>>(
      `${API_BASE_PATH}/clubs/${clubId}/dashboard/monthly-schedules`,
    ),

  getRecentPosts: (clubId: string, params?: { pageNumber?: number; pageSize?: number }) =>
    apiClient.get<ApiResponse<PageData<RecentPost>>>(
      `${API_BASE_PATH}/clubs/${clubId}/dashboard/recent-posts`,
      { params },
    ),

  getProfileStatus: (clubId: string) =>
    apiClient.get<ApiResponse<ProfileStatus>>(
      `${API_BASE_PATH}/clubs/${clubId}/members/me/profile-status`,
    ),
};
