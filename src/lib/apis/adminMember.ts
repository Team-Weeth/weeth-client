import { apiClient } from '@/lib/apis/client';
import type { ClubMember } from '@/types/admin/member';

export const adminMemberApi = {
  getMembers: (clubId: number) =>
    apiClient.get<ClubMember[]>(`/api/v4/admin/clubs/${clubId}/members`),
};
