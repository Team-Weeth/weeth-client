import type { components } from '@/types/api';

type S<K extends keyof components['schemas']> = components['schemas'][K];

// ── Requests ──────────────────────────────────────────────────────────────────

/** 게시글 작성 요청 */
export type CreatePostRequest =
  S<'com.weeth.domain.board.application.dto.request.CreatePostRequest'>;

/** 게시글 수정 요청 */
export type UpdatePostRequest =
  S<'com.weeth.domain.board.application.dto.request.UpdatePostRequest'>;

/** 댓글 작성 요청 */
export type CreateCommentRequest =
  S<'com.weeth.domain.comment.application.dto.request.CommentSaveRequest'>;

/** 댓글 수정 요청 */
export type UpdateCommentRequest =
  S<'com.weeth.domain.comment.application.dto.request.CommentUpdateRequest'>;

// ── Responses ─────────────────────────────────────────────────────────────────

/** 게시글 작성/수정 응답 */
export type PostSaveResponse =
  S<'com.weeth.domain.board.application.dto.response.PostSaveResponse'>;

/** 게시글 좋아요/좋아요 취소 응답 */
export type PostLikeAction =
  S<'com.weeth.domain.board.application.dto.response.PostLikeActionResponse'>;

/** 좋아요 상태 */
export type PostLike = S<'com.weeth.domain.board.application.dto.response.PostLikeResponse'>;

/** 게시판 설정 (쓰기/댓글 권한) */
export type BoardConfig = S<'com.weeth.domain.board.application.dto.response.BoardConfigResponse'>;

/** 게시판 목록 아이템 */
export type BoardListItem = S<'com.weeth.domain.board.application.dto.response.BoardListResponse'>;

/** 게시글 목록 아이템 */
export type PostListItem = S<'com.weeth.domain.board.application.dto.response.PostListResponse'>;

/** 게시글 상세 */
export type PostDetail = S<'com.weeth.domain.board.application.dto.response.PostDetailResponse'>;

/** 댓글 (대댓글 포함) */
export type Comment = S<'com.weeth.domain.comment.application.dto.response.CommentResponse'>;

/** 게시글 목록 슬라이스 (Spring Slice 형태) */
export type PostListSlice = NonNullable<
  S<'com.weeth.global.common.response.CommonResponseOrg.springframework.data.domain.SliceCom.weeth.domain.board.application.dto.response.PostListResponse'>['data']
>;

// ── Derived types ─────────────────────────────────────────────────────────────

/** 게시판 타입 */
export type BoardType = BoardListItem['type'];
