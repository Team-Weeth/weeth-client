import type { components } from '@/types/admin-api';

type S<K extends keyof components['schemas']> = components['schemas'][K];

// ── Requests ──────────────────────────────────────────────────────────────────

/** 게시판 생성 요청 */
export type AdminCreateBoardRequest =
  S<'com.weeth.domain.board.application.dto.request.CreateBoardRequest'>;

/** 게시판 수정 요청 */
export type AdminUpdateBoardRequest =
  S<'com.weeth.domain.board.application.dto.request.UpdateBoardRequest'>;

/** 게시판 순서 변경 요청 */
export type AdminReorderBoardsRequest =
  S<'com.weeth.domain.board.application.dto.request.ReorderBoardsRequest'>;

// ── Responses ─────────────────────────────────────────────────────────────────

/** 게시판 상세 (삭제/비공개 정보 포함) */
export type AdminBoardDetail =
  S<'com.weeth.domain.board.application.dto.response.BoardDetailResponse'>;

/** 게시판 이름 중복 여부 */
export type AdminBoardNameDuplicate =
  S<'com.weeth.domain.board.application.dto.response.BoardNameDuplicateResponse'>;

// ── Derived types ─────────────────────────────────────────────────────────────

/** 게시판 타입 */
export type AdminBoardType = AdminBoardDetail['type'];

/** 게시글 작성 권한 */
export type AdminWritePermission = NonNullable<AdminBoardDetail['writePermission']>;
