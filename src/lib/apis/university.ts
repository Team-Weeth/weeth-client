import { apiClient } from './client';

interface School {
  schoolName: string;
  region: string;
}

interface SchoolsResponse {
  code: number;
  message: string;
  data: School[];
}

export const universityApi = {
  getSchools: () => apiClient.get<SchoolsResponse>('/university/schools'),
};

export type { School, SchoolsResponse };
