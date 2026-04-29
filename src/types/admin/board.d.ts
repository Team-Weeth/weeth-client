export type BoardKind = 'ALL' | 'NOTICE' | 'GALLERY' | 'INFORMATION' | 'GENERAL';
export type BoardVisibility = 'PUBLIC' | 'ADMIN_ONLY' | 'PRIVATE';

export interface Board {
  boardId: number;
  name: string;
  description: string;
  kind: BoardKind;
  visibility: BoardVisibility;
  postCount: number;
  /** 댓글 허용 여부. 전체(ALL) 게시판은 토글이 노출되지 않아 null 일 수 있음 */
  commentEnabled: boolean | null;
  /** 사용자가 수정/삭제할 수 있는 게시판인지 (커스텀 게시판) */
  editable: boolean;
}

/** 휴지통 항목 — 복원 시 원본 Board로 되돌리기 위해 전체 필드를 보존 */
export interface TrashedBoard extends Board {
  /** 영구 삭제까지 남은 일수 (D-N) */
  daysLeft: number;
}

export interface BoardListCache {
  boards: Board[];
  trashedBoards: TrashedBoard[];
}
