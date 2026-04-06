import { apiClient } from './client';

interface School {
  schoolName: string;
  region: string;
}

interface Major {
  majorName: string;
  category: string;
}

interface SchoolsResponse {
  code: number;
  message: string;
  data: School[];
}

interface MajorsResponse {
  code: number;
  message: string;
  data: Major[];
}

export const universityApi = {
  getSchools: () => apiClient.get<SchoolsResponse>('/university/schools'),
  getMajors: () => apiClient.get<MajorsResponse>('/university/majors'),
};

export type { School, Major, SchoolsResponse, MajorsResponse };
