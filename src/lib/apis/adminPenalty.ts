import { apiClient } from '@/lib/apis/client';
import type {
  AdminMemberPenaltyDetail,
  AdminSavePenaltyRequest,
  AdminSavePenaltyRuleRequest,
  AdminUpdatePenaltyRequest,
} from '@/types/api/admin/penalty';
import type { ApiResponse } from '@/types/common';

export const adminPenaltyApi = {
  getMemberPenaltyDetail: (clubId: string, clubMemberId: number) =>
    apiClient.get<ApiResponse<AdminMemberPenaltyDetail>>(
      `/admin/clubs/${clubId}/penalties/members/${clubMemberId}`,
    ),
  assignPenalty: (clubId: string, body: AdminSavePenaltyRequest) =>
    apiClient.post<ApiResponse<null>>(`/admin/clubs/${clubId}/penalties`, body),
  updatePenalty: (clubId: string, body: AdminUpdatePenaltyRequest) =>
    apiClient.patch<ApiResponse<null>>(`/admin/clubs/${clubId}/penalties`, body),
  deletePenalty: (clubId: string, penaltyId: number) =>
    apiClient.delete<ApiResponse<null>>(`/admin/clubs/${clubId}/penalties`, {
      params: { penaltyId },
    }),
  savePenaltyRule: (clubId: string, body: AdminSavePenaltyRuleRequest) =>
    apiClient.put<ApiResponse<null>>(`/admin/clubs/${clubId}/penalties/rule`, body),
};
