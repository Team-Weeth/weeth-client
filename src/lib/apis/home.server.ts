import { apiServer } from '@/lib/apis/server';
import type { HomeDashboardResponse } from '@/types/home';

export const homeServerApi = {
  getDashboard: (clubId: string) =>
    apiServer.get<HomeDashboardResponse>(`/clubs/${clubId}/dashboard/home`, {
      next: { revalidate: 300, tags: [`dashboard-${clubId}`] },
    }),
};
