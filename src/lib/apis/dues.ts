import { apiClient } from '@/lib/apis/client';
import type { ApiResponse } from '@/types/common';
import type {
  CarryOverSource,
  DuesDraftData,
  PaymentTargetsData,
  RegistrationStatus,
  SaveBankAccountBody,
  SaveBasicBody,
  SaveCarryOverBody,
  SavePaymentTargetsBody,
} from '@/types/admin/dues';

export const duesApi = {
  createDraft: (clubId: string, cardinalNumber: number) =>
    apiClient.post<ApiResponse<DuesDraftData>>(
      `/admin/clubs/${clubId}/accounts/drafts`,
      null,
      { params: { cardinalNumber } },
    ),

  discardDraft: (clubId: string, accountId: number) =>
    apiClient.delete(`/admin/clubs/${clubId}/accounts/${accountId}/registration/draft`),

  getRegistrationStatus: (clubId: string, accountId: number) =>
    apiClient.get<ApiResponse<RegistrationStatus>>(
      `/admin/clubs/${clubId}/accounts/${accountId}/registration/status`,
    ),

  saveBasic: (clubId: string, accountId: number, body: SaveBasicBody) =>
    apiClient.patch(`/admin/clubs/${clubId}/accounts/${accountId}/registration/basic`, body),

  getPaymentTargets: (clubId: string, accountId: number, size = 1000) =>
    apiClient.get<ApiResponse<PaymentTargetsData>>(
      `/admin/clubs/${clubId}/accounts/${accountId}/payment-targets`,
      { params: { page: 0, size } },
    ),

  savePaymentTargets: (clubId: string, accountId: number, body: SavePaymentTargetsBody) =>
    apiClient.patch(`/admin/clubs/${clubId}/accounts/${accountId}/payment-targets`, body),

  getCarryOverSource: (clubId: string, accountId: number) =>
    apiClient.get<ApiResponse<CarryOverSource>>(
      `/admin/clubs/${clubId}/accounts/${accountId}/registration/carry-over/source`,
    ),

  saveCarryOver: (clubId: string, accountId: number, body: SaveCarryOverBody) =>
    apiClient.patch(`/admin/clubs/${clubId}/accounts/${accountId}/registration/carry-over`, body),

  saveBankAccount: (clubId: string, accountId: number, body: SaveBankAccountBody) =>
    apiClient.patch(
      `/admin/clubs/${clubId}/accounts/${accountId}/registration/bank-account`,
      body,
    ),

  completeRegistration: (clubId: string, accountId: number) =>
    apiClient.post(`/admin/clubs/${clubId}/accounts/${accountId}/registration/complete`),
};
