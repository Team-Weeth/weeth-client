import { queryOptions, skipToken, useQuery } from '@tanstack/react-query';

import { duesApi } from '@/lib/apis/adminDues';

import { adminQueryKeys } from './adminQueryKeys';

/**
 * 회비 등록(온보딩) 조회 훅.
 *
 * 각 스텝은 마운트 시 서버 상태를 읽어 store에 복원한다. accountId(초안)가
 * 확보되기 전에는 조회할 수 없으므로 `skipToken`으로 요청을 건너뛴다.
 *
 * queryOptions 팩토리로 분리해 Step1의 lazy 복원(queryClient.fetchQuery)과
 * Step2/3의 useQuery가 동일한 캐시 키를 공유하도록 한다.
 */

export function duesRegistrationStatusQueryOptions(clubId: string, accountId: number | null) {
  return queryOptions({
    queryKey: adminQueryKeys.duesRegistrationStatus(clubId, accountId),
    queryFn:
      accountId !== null
        ? () => duesApi.getRegistrationStatus(clubId, accountId).then((res) => res.data.data)
        : skipToken,
  });
}

export function duesPaymentTargetsQueryOptions(clubId: string, accountId: number | null) {
  return queryOptions({
    queryKey: adminQueryKeys.duesPaymentTargets(clubId, accountId),
    queryFn:
      accountId !== null
        ? () => duesApi.getPaymentTargets(clubId, accountId).then((res) => res.data.data)
        : skipToken,
  });
}

export function duesCarryOverSourceQueryOptions(clubId: string, accountId: number | null) {
  return queryOptions({
    queryKey: adminQueryKeys.duesCarryOverSource(clubId, accountId),
    queryFn:
      accountId !== null
        ? () => duesApi.getCarryOverSource(clubId, accountId).then((res) => res.data.data)
        : skipToken,
  });
}

export function useDuesPaymentTargetsQuery(clubId: string, accountId: number | null) {
  return useQuery(duesPaymentTargetsQueryOptions(clubId, accountId));
}

export function useDuesCarryOverSourceQuery(clubId: string, accountId: number | null) {
  return useQuery(duesCarryOverSourceQueryOptions(clubId, accountId));
}
