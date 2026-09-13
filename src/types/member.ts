export type MemberRole = 'LEAD' | 'ADMIN' | 'USER';

export type MemberPosition = '프론트엔드' | '백엔드' | '디자인' | '기획';

export interface MemberProfile {
  id: number;
  name: string;
  profileImageUrl: string | null;
  // position(직군)은 아직 어떤 API에도 없는 필드 — 백엔드 지원 전까지 항상 undefined
  coverImageUrl?: string | null;
  cardinals: number[];
  role: MemberRole;
  position?: MemberPosition;
  description: string;
  phone?: string;
  email?: string;
  department?: string;
  studentId?: string;
  postCount?: number;
}

export interface ClubMemberListItem {
  clubMemberId: number;
  name: string;
  profileImageUrl: string | null;
  memberRole: MemberRole;
  cardinals: number[];
  bio: string | null;
}

export interface ClubMemberDetail {
  clubMemberId: number;
  name: string;
  profileImageUrl: string | null;
  headerImageUrl: string | null;
  memberRole: MemberRole;
  cardinals: number[];
  bio: string | null;
  tel: string;
  email: string;
  studentId: string;
  department: string;
  postCount: number;
}

export interface MemberListParams {
  cardinalNumber?: number;
  memberRole?: MemberRole;
  keyword?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface MemberPostListItem {
  postId: number;
  clubId: string;
  clubName: string;
  boardId: number;
  boardName: string;
  title: string;
  content: string;
  commentCount: number;
  likeCount: number;
  createdAt: string;
  isNew: boolean;
}
