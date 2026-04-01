import { apiClient } from './client';

export const clubApi = {
  getById: (clubId: string) => apiClient.get(`/clubs/${clubId}`),
  join: (clubId: string, code: string) => apiClient.post(`/clubs/${clubId}/join`, { code }),
};
