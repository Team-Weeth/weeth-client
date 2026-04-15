import { apiClient } from '@/lib/apis/client';
import type { Club } from '@/types/club';
import type { ApiResponse } from '@/types/common';

export interface ClubImagePayload {
  storageKey: string;
  fileName: string;
  fileSize: number;
  contentType: string;
}

export interface UpdateClubBody {
  name?: string;
  schoolName?: string;
  description?: string;
  contactPhoneNumber?: string;
  contactEmail?: string;
  primaryContact?: 'PHONE' | 'EMAIL';
  profileImage?: ClubImagePayload;
  backgroundImage?: ClubImagePayload;
}

export const adminClubApi = {
  getDetail: (clubId: string) => apiClient.get<ApiResponse<Club>>(`/admin/clubs/${clubId}`),

  update: (clubId: string, body: UpdateClubBody) =>
    apiClient.patch<ApiResponse<Club>>(`/admin/clubs/${clubId}`, body),

  deleteProfileImage: (clubId: string) => apiClient.delete(`/admin/clubs/${clubId}/profile-image`),

  deleteBackgroundImage: (clubId: string) =>
    apiClient.delete(`/admin/clubs/${clubId}/background-image`),
};
