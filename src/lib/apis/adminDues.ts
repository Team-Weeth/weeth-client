import { apiClient } from '@/lib/apis/client';
import type { ApiResponse } from '@/types/common';
import type {
  BulkPaidBody,
  BulkRefundBody,
  BulkUnpaidBody,
  CarryOverSource,
  DuesDashboard,
  DuesDraftData,
  MemberVisibilityBody,
  PaymentTargetsData,
  RegistrationStatus,
  SaveBankAccountBody,
  SaveBasicBody,
  SaveCarryOverBody,
  SavePaymentTargetsBody,
  TransactionBody,
  TransactionsInfo,
} from '@/types/admin/dues';

export const duesApi = {
  createTransaction: (clubId: string, accountId: number, body: TransactionBody) =>
    apiClient.post(`/admin/clubs/${clubId}/accounts/${accountId}/transactions`, body),

  updateTransaction: (
    clubId: string,
    accountId: number,
    transactionId: number,
    body: TransactionBody,
  ) =>
    apiClient.patch(
      `/admin/clubs/${clubId}/accounts/${accountId}/transactions/${transactionId}`,
      body,
    ),

  deleteTransaction: (clubId: string, accountId: number, transactionId: number) =>
    apiClient.delete(`/admin/clubs/${clubId}/accounts/${accountId}/transactions/${transactionId}`),

  getTransactions: (clubId: string, accountId: number) =>
    apiClient.get<ApiResponse<TransactionsInfo>>(
      `/admin/clubs/${clubId}/accounts/${accountId}/transactions`,
    ),

  // 부원 거래 내역 공개 여부 수정
  updateMemberVisibility: (clubId: string, accountId: number, body: MemberVisibilityBody) =>
    apiClient.patch(`/admin/clubs/${clubId}/accounts/${accountId}/member-visibility`, body),

  // 회비 대시보드 조회
  getDashboard: (clubId: string, cardinalNumber: number) =>
    apiClient.get<ApiResponse<DuesDashboard>>(
      `/admin/clubs/${clubId}/accounts/${cardinalNumber}/dashboard`,
    ),

  // ----- 회비 온보딩 ------
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

  getPaymentTargets: (clubId: string, accountId: number, size = 100) =>
    apiClient.get<ApiResponse<PaymentTargetsData>>(
      `/admin/clubs/${clubId}/accounts/${accountId}/registration/payment-targets`,
      { params: { page: 0, size } },
    ),

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

  // ----- 납부 대상 벌크 처리 ------
  // 납부 정정(벌크): 잘못 확인한 납부를 취소하고 회비 거래를 원복
  markPaymentTargetsUnpaid: (clubId: string, accountId: number, body: BulkUnpaidBody) =>
    apiClient.patch(`/admin/clubs/${clubId}/accounts/${accountId}/payment-targets/unpaid`, body),

  // 환불(벌크): 납부 완료 대상을 환불 처리하고 시스템 환불 지출 거래 생성
  refundPaymentTargets: (clubId: string, accountId: number, body: BulkRefundBody) =>
    apiClient.patch(`/admin/clubs/${clubId}/accounts/${accountId}/payment-targets/refund`, body),

  // 납부 확인(벌크): 대상을 납부 완료 처리하고 시스템 회비 수입 거래 생성
  markPaymentTargetsPaid: (clubId: string, accountId: number, body: BulkPaidBody) =>
    apiClient.patch(`/admin/clubs/${clubId}/accounts/${accountId}/payment-targets/paid`, body),
};
