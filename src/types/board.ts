import { CreatePostFile, FileItem } from './file';

// 페이지네이션 타입은 common.ts에서 관리, 하위 호환을 위해 re-export
export type { Slice, SliceSort, SlicePageable } from '@/types/common';
// 파일 타입은 file.ts에서 관리, 하위 호환을 위해 re-export
export type { FileStatus, FileItem, DisplayFile, CreatePostFile } from '@/types/file';

export type BoardType = 'ALL' | 'NOTICE' | 'GENERAL';

export type UserRole = 'USER' | 'ADMIN';

interface BoardBase {
  id: number | null;
  type: BoardType;
}

export interface BoardNavItem extends BoardBase {
  label: string;
}

export interface Board extends BoardBase {
  name: string;
}

export interface PostAuthor {
  id: number;
  name: string;
  profileImageUrl: string;
  role: UserRole;
}

export interface PostLike {
  isLiked: boolean;
  likeCount: number;
}

interface PostBase {
  id: number;
  author: PostAuthor;
  boardId: number;
  boardName: string;
  title: string;
  content: string;
  time: string;
  commentCount: number;
  like: PostLike;
}

export interface PostListItem extends PostBase {
  fileUrls: FileItem[];
  isNew: boolean;
}

export interface PostComment {
  id: number;
  author: PostAuthor;
  content: string;
  time: string;
  fileUrls: FileItem[];
  children: PostComment[];
}

export interface PostDetail extends PostBase {
  isNew?: boolean;
  comments: PostComment[];
  fileUrls: FileItem[];
}

/** 게시글 작성 요청 body */
export interface CreatePostBody {
  title: string;
  content: string;
  files: CreatePostFile[];
}

/** 게시글 작성 응답 data */
export interface CreatePostData {
  id: number;
}

/** 게시글 수정 요청 body — files: null=변경 없음, []=전체 삭제, 배열=교체 */
export interface UpdatePostBody {
  title: string;
  content: string;
  files: CreatePostFile[] | null;
}

/** 게시글 수정 응답 data */
export interface UpdatePostData {
  id: number;
}

/** 댓글 작성 요청 body */
export interface CreateCommentBody {
  parentCommentId?: number | null;
  content: string;
  files: CreatePostFile[];
}

/** 댓글 수정 요청 body — files: null=기존 유지, []=전체 삭제, 배열=교체 */
export interface UpdateCommentBody {
  content: string;
  files: CreatePostFile[] | null;
}

/** mapComment 변환 결과 (UI 표시용) */
export interface MappedComment {
  id: number;
  profileImage: string;
  name: string;
  content: string;
  date: string;
  isAuthor: boolean;
  isDeleted: boolean;
  replies: MappedComment[];
}
