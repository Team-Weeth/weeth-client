import { apiClient } from '@/lib/apis/client';
import type { ApiResponse } from '@/types/common';
import type { WaxRanking, WaxRankingPeriod } from '@/types/wax';

export const waxRankingApi = {
  /** 로그인 없이 조회한다. 기기 토큰을 함께 보내면 내 순위(me)도 받는다. */
  get: (period: WaxRankingPeriod, token?: string) =>
    apiClient.get<ApiResponse<WaxRanking>>('/minigame/wax/rankings', {
      params: { period },
      headers: token ? { 'X-Wax-Token': token } : undefined,
    }),
};
