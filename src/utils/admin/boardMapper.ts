import type { AdminBoardDto, AdminBoardWritePermission } from '@/lib/apis/adminBoard';
import type { Board, BoardVisibility } from '@/types/admin/board';

export function mapVisibility(
  writePermission: AdminBoardWritePermission,
  isPrivate: boolean,
): BoardVisibility {
  if (isPrivate) return 'PRIVATE';
  if (writePermission === 'ADMIN') return 'ADMIN_ONLY';
  return 'PUBLIC';
}

export function toApiPermission(visibility: BoardVisibility): {
  writePermission: AdminBoardWritePermission;
  isPrivate: boolean;
} {
  return {
    writePermission: visibility === 'ADMIN_ONLY' ? 'ADMIN' : 'USER',
    isPrivate: visibility === 'PRIVATE',
  };
}

export function toBoard(dto: AdminBoardDto): Board {
  return {
    boardId: dto.id,
    name: dto.name,
    description: dto.description ?? '',
    kind: dto.type,
    visibility: mapVisibility(dto.writePermission, dto.isPrivate),
    postCount: dto.postCount,
    commentEnabled: dto.type === 'ALL' || dto.type === 'NOTICE' ? null : dto.commentEnabled,
    editable: dto.type === 'GENERAL',
  };
}
