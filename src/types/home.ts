import type { ApiResponse } from '@/types/common';

import type {
  Identifiable,
  Named,
  NullableImage,
  Role,
  UserInfo,
  UserSummary,
  WithProfileImage,
  WithRole,
} from '@/types/user';

import type { FileItem } from '@/types/file';

interface ClubInfo {
  id: string;
  name: string;
  code: string;
  schoolName: string;
  description: string;
  memberCount: number;
  profileImageUrl: NullableImage;
  backgroundImageUrl: NullableImage;
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

interface RecentNotice extends UnreadNotice {
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

type PostAuthor = UserSummary;

interface RecentPost {
  id: number;
  author: PostAuthor;
  title: string;
  content: string;
  time: string;
  commentCount: number;
  like: { isLiked: boolean; likeCount: number };
  fileUrls: FileItem[];
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
  Role,
  NullableImage,
  ClubInfo,
  Identifiable,
  Named,
  WithProfileImage,
  WithRole,
  UserSummary,
  UserInfo,
  MyInfo,
  HomeDashboard,
  HomeDashboardResponse,
  UnreadNotice,
  RecentNotice,
  MonthlySchedule,
  PostAuthor,
  RecentPost,
  SortInfo,
  PageableInfo,
  PageData,
  ProfileStatus,
};
