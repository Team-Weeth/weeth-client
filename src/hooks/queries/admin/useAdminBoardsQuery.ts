import { useQuery } from '@tanstack/react-query';

import { adminBoardApi, type AdminBoardDto } from '@/lib/apis/adminBoard';
import { useClubId } from '@/stores';
import type { Board, BoardVisibility } from '@/types/admin/board';
import type { TrashedBoard } from '@/components/admin/board/modal/TrashBoardModal';

const TRASH_RETENTION_DAYS = 30;

function mapVisibility(writePermission: string, isPrivate: boolean): BoardVisibility {
  if (isPrivate) return 'PRIVATE';
  if (writePermission === 'ADMIN') return 'ADMIN_ONLY';
  return 'PUBLIC';
}

function toBoard(dto: AdminBoardDto): Board {
  return {
    boardId: dto.id,
    name: dto.name,
    description: '',
    kind: dto.type,
    visibility: mapVisibility(dto.writePermission, dto.isPrivate),
    postCount: dto.postCount,
    commentEnabled: dto.type === 'ALL' ? null : dto.commentEnabled,
    editable: dto.type === 'CUSTOM',
  };
}

export function useAdminBoardsQuery() {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['admin', 'boards', clubId],
    queryFn: async () => {
      const res = await adminBoardApi.getBoards(clubId!);
      const all = res.data.data;

      const boards = all
        .filter((d) => !d.isDeleted)
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map(toBoard);

      const trashedBoards: TrashedBoard[] = all
        .filter((d) => d.isDeleted)
        .map((d) => ({ ...toBoard(d), daysLeft: TRASH_RETENTION_DAYS }));

      return { boards, trashedBoards };
    },
    enabled: !!clubId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
