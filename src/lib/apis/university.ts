import { ApiResponse } from '@/types';
import { apiClient } from './client';

interface School {
  schoolName: string;
  region: string;
}

interface Major {
  majorName: string;
  category: string;
}

export const universityApi = {
  getSchools: () => apiClient.get<ApiResponse<School[]>>('/university/schools'),
  getMajors: () => apiClient.get<ApiResponse<Major[]>>('/university/majors'),
};

export type { School, Major };
