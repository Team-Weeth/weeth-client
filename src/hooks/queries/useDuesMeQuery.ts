import { useQuery } from '@tanstack/react-query';

import { duesApi } from '@/lib/apis/dues';
import { parseApiError } from '@/lib/error';
import { useClubId } from '@/stores';
import type { DuesMeResponse, DuesSummary } from '@/types/dues';
import type { Cardinal } from '@/types/admin/cardinal';

const DUES_PRIVATE_ERROR_CODE = 20114;

function shouldRetryDuesQuery(failureCount: number, error: unknown) {
  if (parseApiError(error)?.code === DUES_PRIVATE_ERROR_CODE) return false;

  return failureCount < 3;
}

function mapDuesMeToSummary(data: DuesMeResponse): DuesSummary {
  return {
    accountId: data.accountId,
    accountName: data.accountName,
    cardinalNumber: data.cardinal,
    duesAmount: data.duesAmount,
    currentBalance: data.balance.currentBalance,
    isTargeted: data.myPayment.targeted,
    paymentStatus: data.myPayment.status,
    isPaid: data.myPayment.status === 'PAID',
    isAccountPublic: data.bankAccountVisible,
    account: data.bankAccount
      ? {
          bankName: data.bankAccount.bankName,
          accountNumber: data.bankAccount.accountNumber,
          holderName: data.bankAccount.holder,
          guide: data.bankAccount.guide,
        }
      : undefined,
    paidAmount: data.myPayment.paidAmount,
    dueAmount: data.myPayment.dueAmount,
    paidAt: data.myPayment.paidAt ?? undefined,
  };
}

function useDuesCardinals() {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['dues', 'cardinals', clubId],
    queryFn: async () => {
      const response = await duesApi.getCardinals(clubId!);

      return response.data.data.map(
        ({ cardinal, isLatest }) =>
          ({
            id: cardinal,
            cardinalNumber: cardinal,
            status: isLatest ? 'IN_PROGRESS' : 'COMPLETED',
            createdAt: '',
            modifiedAt: '',
          }) satisfies Cardinal,
      );
    },
    enabled: !!clubId,
    staleTime: 30 * 60 * 1000,
    retry: shouldRetryDuesQuery,
  });
}

function useDuesVisibility() {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['dues', 'visibility', clubId],
    queryFn: async () => {
      const response = await duesApi.getVisibility(clubId!);

      return response.data.data;
    },
    enabled: !!clubId,
    staleTime: 30 * 60 * 1000,
    retry: shouldRetryDuesQuery,
  });
}

function useDuesMe(cardinal?: number) {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['dues', 'me', clubId, cardinal],
    queryFn: async () => {
      const response = await duesApi.getMyDues(clubId!, cardinal!);

      return mapDuesMeToSummary(response.data.data);
    },
    enabled: !!clubId && typeof cardinal === 'number',
    retry: shouldRetryDuesQuery,
  });
}

export { useDuesCardinals, useDuesVisibility, useDuesMe, mapDuesMeToSummary };
