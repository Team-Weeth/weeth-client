import type { ApiResponse } from '@/types/common';

interface ClubInfo {
  id: string;
  name: string;
  code: string;
  schoolName: string;
  description: string;
  memberCount: number;
  profileImageUrl: string | null;
  backgroundImageUrl: string | null;
}

interface UserInfo {
  id: number;
  name: string;
  profileImageUrl: string | null;
  role: 'LEAD' | 'USER';
}

interface MyInfo {
  userInfo: UserInfo;
  bio: string | null;
}

interface HomeDashboard {
  club: ClubInfo;
  myInfo: MyInfo;
}

interface UnreadNotice {
  id: number;
  title: string;
  content: string;
}

interface RecentNotice {
  id: number;
  title: string;
  content: string;
  time: string;
  isNew: boolean;
}

interface MonthlySchedule {
  id: number;
  title: string;
  start: string;
  end: string;
  type: string;
}

interface FileAttachment {
  fileId: number;
  fileName: string;
  fileUrl: string;
  storageKey: string;
  fileSize: number;
  contentType: string;
  status: string;
}

interface PostAuthor {
  id: number;
  name: string;
  profileImageUrl: string | null;
  role: 'LEAD' | 'USER';
}

interface RecentPost {
  id: number;
  author: PostAuthor;
  title: string;
  content: string;
  time: string;
  commentCount: number;
  likeCount: number;
  fileUrls: FileAttachment[];
  isNew: boolean;
}

interface SortInfo {
  empty: boolean;
  unsorted: boolean;
  sorted: boolean;
}

interface PageableInfo {
  offset: number;
  sort: SortInfo;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  unpaged: boolean;
}

interface PageData<T> {
  size: number;
  content: T[];
  number: number;
  sort: SortInfo;
  pageable: PageableInfo;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

interface ProfileStatus {
  cardinalAssigned: boolean;
  profileCompleted: boolean;
  missingFields: string[];
}

type HomeDashboardResponse = ApiResponse<HomeDashboard>;

export type {
  ClubInfo,
  UserInfo,
  MyInfo,
  HomeDashboard,
  HomeDashboardResponse,
  UnreadNotice,
  RecentNotice,
  MonthlySchedule,
  FileAttachment,
  PostAuthor,
  RecentPost,
  SortInfo,
  PageableInfo,
  PageData,
  ProfileStatus,
};
