import { useQuery } from '@tanstack/react-query';

import { duesApi } from '@/lib/apis/dues';
import { useClubId } from '@/stores';
import type { DuesMeResponse, DuesSummary } from '@/types/dues';
import type { Cardinal } from '@/types/admin/cardinal';

function mapDuesMeToSummary(data: DuesMeResponse): DuesSummary {
  return {
    accountId: data.accountId,
    accountName: data.accountName,
    cardinalNumber: data.cardinal,
    duesAmount: data.duesAmount,
    currentBalance: data.balance.currentBalance,
    targetBalance: data.balance.goalAmount,
    isTargeted: data.myPayment.targeted,
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
    retry: false,
  });
}

export { useDuesCardinals, useDuesMe, mapDuesMeToSummary };
