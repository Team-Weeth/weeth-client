import type { ApiResponse } from '@/types/common';
import type { Club } from '@/types';

import { apiClient } from './client';

export const clubApi = {
  getById: (clubId: string) => apiClient.get<ApiResponse<Club>>(`/clubs/${clubId}`),
  create: (body: {
    name: string;
    schoolName: string;
    description: string;
    contactEmail: string | null;
    contactPhoneNumber: string;
    primaryContact: 'PHONE' | 'EMAIL';
    currentCardinal: number;
    profileImage: null;
    backgroundImage: null;
  }) => apiClient.post<ApiResponse<{ clubId: string; clubName: string } | null>>('/clubs', body),
  join: (clubId: string, code: string) =>
    apiClient.post<ApiResponse<void>>(`/clubs/${clubId}/join`, { code }),
};
