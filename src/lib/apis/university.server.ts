import { apiServer } from '@/lib/apis/server';
import type { ApiResponse } from '@/types/common';

interface School {
  schoolName: string;
  region: string;
}

interface Major {
  majorName: string;
  category: string;
}

export const universityServerApi = {
  /** 학교 목록 — 거의 변하지 않으므로 1시간 캐싱 */
  getSchools: () =>
    apiServer.get<ApiResponse<School[]>>('/university/schools', {
      next: { revalidate: 3600 },
    }),

  /** 학과 목록 — 거의 변하지 않으므로 1시간 캐싱 */
  getMajors: () =>
    apiServer.get<ApiResponse<Major[]>>('/university/majors', {
      next: { revalidate: 3600 },
    }),
};

export type { School, Major };
