import { skipToken, useQuery } from '@tanstack/react-query';

import { DUES_NOT_REGISTERED_CODE } from '@/constants/admin/dues.constants';
import { duesApi } from '@/lib/apis/dues';
import { getApiErrorCode } from '@/utils/shared/getApiErrorCode';

import { adminQueryKeys } from './adminQueryKeys';

/**
 * 회비 대시보드 조회 훅.
 *
 * 등록이 완료되지 않은 장부(온보딩 미완료)에서는 서버가 20112 코드로 응답한다.
 * 이 경우는 정상적인 온보딩 유도 흐름이므로 재시도하지 않고, 호출부에서
 * {@link isDuesNotRegisteredError}로 판별해 튜토리얼 모달을 띄운다.
 */
export function useDuesDashboardQuery(clubId: string, cardinalNumber: number | null) {
  return useQuery({
    queryKey: adminQueryKeys.duesDashboard(clubId, cardinalNumber),
    queryFn:
      cardinalNumber !== null
        ? () => duesApi.getDashboard(clubId, cardinalNumber).then((res) => res.data.data)
        : skipToken,
    retry: (failureCount, error) =>
      !isDuesNotRegisteredError(error) && failureCount < 3,
  });
}

/** 대시보드 조회 에러가 "등록 미완료 장부(20112)"인지 판별 */
export function isDuesNotRegisteredError(error: unknown): boolean {
  return getApiErrorCode(error) === DUES_NOT_REGISTERED_CODE;
}
