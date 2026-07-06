import { apiClient } from '@/lib/apis/client';
import type { ApiResponse } from '@/types/common';
import type {
  DuesCardinal,
  DuesMeResponse,
  DuesTransactionDetailResponse,
  DuesTransactionApiFilter,
  DuesTransactionApiSort,
  DuesTransactionsResponse,
} from '@/types/dues';

export const duesApi = {
  getCardinals: (clubId: string) =>
    apiClient.get<ApiResponse<DuesCardinal[]>>(`/clubs/${clubId}/accounts/cardinals`),
  getMyDues: (clubId: string, cardinal: number) =>
    apiClient.get<ApiResponse<DuesMeResponse>>(`/clubs/${clubId}/accounts/${cardinal}/me`),
  getTransactions: (
    clubId: string,
    cardinal: number,
    params?: {
      filter?: DuesTransactionApiFilter;
      sort?: DuesTransactionApiSort;
      page?: number;
      size?: number;
    },
  ) =>
    apiClient.get<ApiResponse<DuesTransactionsResponse>>(
      `/clubs/${clubId}/accounts/${cardinal}/transactions`,
      { params },
    ),
  getTransactionDetail: (clubId: string, cardinal: number, transactionId: number) =>
    apiClient.get<ApiResponse<DuesTransactionDetailResponse>>(
      `/clubs/${clubId}/accounts/${cardinal}/transactions/${transactionId}`,
    ),
};
