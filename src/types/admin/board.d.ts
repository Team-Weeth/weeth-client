export type BoardKind = 'ALL' | 'NOTICE' | 'GALLERY' | 'INFORMATION' | 'GENERAL';
export type BoardVisibility = 'PUBLIC' | 'ADMIN_ONLY' | 'PRIVATE';

export interface Board {
  boardId: number;
  name: string;
  description: string;
  kind: BoardKind;
  visibility: BoardVisibility;
  postCount: number;
  /** 댓글 허용 여부. ALL/NOTICE 등 일부 게시판은 토글이 노출되지 않음 */
  commentEnabled: boolean | null;
  /** 사용자가 수정/삭제할 수 있는 게시판인지 (커스텀 게시판) */
  editable: boolean;
}
