// 페이지네이션 타입은 common.ts에서 관리, 하위 호환을 위해 re-export
export type { Slice, SliceSort, SlicePageable } from '@/types/common';

export type BoardType = 'ALL' | 'NOTICE' | 'GENERAL';

export type UserRole = 'USER' | 'ADMIN';

export type FileStatus = 'UPLOADED' | 'PENDING' | 'DELETED';

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
  hasFile: boolean;
  isNew: boolean;
}

/** API 응답 파일 (서버에서 받은 원본) */
export interface FileItem {
  fileId: number;
  fileName: string;
  fileUrl: string;
  storageKey: string;
  fileSize: number;
  contentType: string;
  status: FileStatus;
}

/** 조회용 파일 (컴포넌트 표시 전용) */
export interface DisplayFile {
  id: string | number;
  fileName: string;
  fileUrl: string;
  uploaded?: boolean;
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

/** 게시글 작성 요청 파일 */
export interface CreatePostFile {
  fileName: string;
  storageKey: string;
  fileSize: number;
  contentType: string;
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

/** mapComment 변환 결과 (UI 표시용) */
export interface MappedComment {
  id: number;
  profileImage: string;
  name: string;
  content: string;
  date: string;
  isAuthor: boolean;
  replies: MappedComment[];
}
