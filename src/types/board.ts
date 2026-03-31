export interface BoardNavItem {
  id: number | null;
  label: string;
  type: 'NOTICE' | 'ALL' | 'GENERAL';
}

export type BoardType = 'ALL' | 'NOTICE' | 'GENERAL';

export interface Board {
  id: number | null;
  name: string;
  type: BoardType;
}

export type UserRole = 'USER' | 'ADMIN';

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

export interface PostListItem {
  id: number;
  author: PostAuthor;
  boardId: number;
  boardName: string;
  title: string;
  content: string;
  time: string;
  commentCount: number;
  like: PostLike;
  hasFile: boolean;
  isNew: boolean;
}

export type FileStatus = 'UPLOADED' | 'PENDING' | 'DELETED';

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

export interface PostDetail {
  id: number;
  boardId: number;
  boardName: string;
  author: PostAuthor;
  title: string;
  content: string;
  time: string;
  commentCount: number;
  like: PostLike;
  comments: PostComment[];
  fileUrls: FileItem[];
}

export interface SliceSort {
  empty: boolean;
  unsorted: boolean;
  sorted: boolean;
}

export interface SlicePageable {
  offset: number;
  sort: SliceSort;
  unpaged: boolean;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
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

export interface Slice<T> {
  size: number;
  content: T[];
  number: number;
  sort: SliceSort;
  pageable: SlicePageable;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
