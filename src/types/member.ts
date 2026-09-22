export type MemberRole = 'LEAD' | 'ADMIN' | 'USER';

export type ClubMemberPositionColor =
  | 'PRIMARY'
  | 'SECONDARY'
  | 'PURPLE'
  | 'PINK'
  | 'CAUTION'
  | 'ERROR';

export interface ClubMemberPosition {
  id: number;
  name: string;
  color: ClubMemberPositionColor;
  displayOrder: number;
}

export interface MemberProfile {
  id: number;
  name: string;
  profileImageUrl: string | null;
  coverImageUrl?: string | null;
  cardinals: number[];
  role: MemberRole;
  position?: ClubMemberPosition | null;
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
  position: ClubMemberPosition | null;
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
  position: ClubMemberPosition | null;
}

export interface MemberListParams {
  cardinalNumber?: number;
  memberRole?: MemberRole;
  keyword?: string;
  positionOptionId?: number;
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
