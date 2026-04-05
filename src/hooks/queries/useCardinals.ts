import { useQuery } from '@tanstack/react-query';

import { cardinalApi } from '@/lib/apis/cardinal';
import { useClubId } from '@/stores';
import type { Cardinal } from '@/types/admin/cardinal';

// TODO: API에 데이터 채워지면 제거
const MOCK_CARDINALS: Cardinal[] = [
  {
    id: 1,
    cardinalNumber: 1,
    status: 'COMPLETED',
    createdAt: '2024-03-01T00:00:00.000Z',
    modifiedAt: '2024-03-01T00:00:00.000Z',
  },
  {
    id: 2,
    cardinalNumber: 2,
    status: 'COMPLETED',
    createdAt: '2024-09-01T00:00:00.000Z',
    modifiedAt: '2024-09-01T00:00:00.000Z',
  },
  {
    id: 3,
    cardinalNumber: 3,
    status: 'COMPLETED',
    createdAt: '2025-03-01T00:00:00.000Z',
    modifiedAt: '2025-03-01T00:00:00.000Z',
  },
  {
    id: 4,
    cardinalNumber: 4,
    status: 'COMPLETED',
    createdAt: '2025-09-01T00:00:00.000Z',
    modifiedAt: '2025-09-01T00:00:00.000Z',
  },
  {
    id: 5,
    cardinalNumber: 5,
    status: 'COMPLETED',
    createdAt: '2026-03-01T00:00:00.000Z',
    modifiedAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 6,
    cardinalNumber: 6,
    status: 'COMPLETED',
    createdAt: '2026-03-15T00:00:00.000Z',
    modifiedAt: '2026-03-15T00:00:00.000Z',
  },
  {
    id: 7,
    cardinalNumber: 7,
    status: 'IN_PROGRESS',
    createdAt: '2026-04-05T14:22:59.718Z',
    modifiedAt: '2026-04-05T14:22:59.718Z',
  },
];

export function useCardinals() {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['cardinals', clubId],
    queryFn: async () => {
      const res = await cardinalApi.getCardinals(clubId!);
      const data = res.data.data;
      // TODO: API에 데이터 채워지면 MOCK fallback 제거
      return data.length > 0 ? data : MOCK_CARDINALS;
    },
    enabled: !!clubId,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}
