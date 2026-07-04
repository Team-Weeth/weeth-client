import { apiClient } from '@/lib/apis/client';
import type { ApiResponse } from '@/types/common';
import type {
  CarryOverSource,
  DuesDashboard,
  DuesDraftData,
  PaymentTargetsData,
  RegistrationStatus,
  SaveBankAccountBody,
  SaveBasicBody,
  SaveCarryOverBody,
  SavePaymentTargetsBody,
} from '@/types/admin/dues';

export const duesApi = {
  // 회비 대시보드 조회 — cardinal 경로 변수는 기수 번호(cardinalNumber)
  getDashboard: (clubId: string, cardinalNumber: number) =>
    apiClient.get<ApiResponse<DuesDashboard>>(
      `/admin/clubs/${clubId}/accounts/${cardinalNumber}/dashboard`,
    ),

  createDraft: (clubId: string, cardinalNumber: number) =>
    apiClient.post<ApiResponse<DuesDraftData>>(`/admin/clubs/${clubId}/accounts/drafts`, null, {
      params: { cardinalNumber },
    }),

  discardDraft: (clubId: string, accountId: number) =>
    apiClient.delete(`/admin/clubs/${clubId}/accounts/${accountId}/registration/draft`),

  getRegistrationStatus: (clubId: string, accountId: number) =>
    apiClient.get<ApiResponse<RegistrationStatus>>(
      `/admin/clubs/${clubId}/accounts/${accountId}/registration/status`,
    ),

  saveBasic: (clubId: string, accountId: number, body: SaveBasicBody) =>
    apiClient.patch(`/admin/clubs/${clubId}/accounts/${accountId}/registration/basic`, body),

  // 소비자(Step2/Step5/PaymentTargetModal)가 targets.content를 전체 목록으로
  // 사용하므로, 여러 페이지로 나뉘어 오면 모든 페이지를 합쳐 단일 목록으로 내려준다.
  getPaymentTargets: async (clubId: string, accountId: number, size = 100) => {
    const url = `/admin/clubs/${clubId}/accounts/${accountId}/registration/payment-targets`;

    const firstResponse = await apiClient.get<ApiResponse<PaymentTargetsData>>(url, {
      params: { page: 0, size },
    });

    const { targets } = firstResponse.data.data;
    if (targets.totalPages <= 1) return firstResponse;

    const remainingContents = await Promise.all(
      Array.from({ length: targets.totalPages - 1 }, (_, index) =>
        apiClient
          .get<ApiResponse<PaymentTargetsData>>(url, { params: { page: index + 1, size } })
          .then((res) => res.data.data.targets.content),
      ),
    );

    const mergedContent = [targets.content, ...remainingContents].flat();
    firstResponse.data.data = {
      ...firstResponse.data.data,
      targets: {
        ...targets,
        content: mergedContent,
        pageNumber: 0,
        pageSize: mergedContent.length,
      },
    };
    return firstResponse;
  },

  savePaymentTargets: (clubId: string, accountId: number, body: SavePaymentTargetsBody) =>
    apiClient.put(
      `/admin/clubs/${clubId}/accounts/${accountId}/registration/payment-targets`,
      body,
    ),

  getCarryOverSource: (clubId: string, accountId: number) =>
    apiClient.get<ApiResponse<CarryOverSource>>(
      `/admin/clubs/${clubId}/accounts/${accountId}/registration/carry-over/source`,
    ),

  saveCarryOver: (clubId: string, accountId: number, body: SaveCarryOverBody) =>
    apiClient.patch(`/admin/clubs/${clubId}/accounts/${accountId}/registration/carry-over`, body),

  saveBankAccount: (clubId: string, accountId: number, body: SaveBankAccountBody) =>
    apiClient.patch(`/admin/clubs/${clubId}/accounts/${accountId}/registration/bank-account`, body),

  completeRegistration: (clubId: string, accountId: number) =>
    apiClient.post(`/admin/clubs/${clubId}/accounts/${accountId}/registration/complete`),
};
