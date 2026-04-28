import { useQuery } from '@tanstack/react-query';

import { adminBoardApi } from '@/lib/apis/adminBoard';
import { useClubId } from '@/stores';
import { toBoard } from '@/utils/admin/boardMapper';
// import { TRASH_RETENTION_DAYS } from '@/constants/admin/board.constants';
import type { TrashedBoard } from '@/types/admin/board';
import { adminBoardQueryKeys } from './boardQueryKeys';

export function useAdminBoardsQuery() {
  const clubId = useClubId();

  return useQuery({
    queryKey: adminBoardQueryKeys.list(clubId),
    queryFn: async () => {
      const res = await adminBoardApi.getBoards(clubId!);
      const all = res.data.data;

      const boards = all
        .filter((d) => !d.isDeleted)
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map(toBoard);

      // TODO: 휴지통 API 정상화되면 다시 구현
      // const trashedBoards: TrashedBoard[] = all
      //   .filter((d) => d.isDeleted)
      //   .map((d) => ({ ...toBoard(d), daysLeft: TRASH_RETENTION_DAYS }));
      const trashedBoards: TrashedBoard[] = [];

      return { boards, trashedBoards };
    },
    enabled: !!clubId,
    retry: false,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
  });
}
