export type MemberRole = 'USER' | 'ADMIN';
export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';

export interface MyMember {
  userId: number;
  clubMemberId: number;
  name: string | null;
  email: string | null;
  tel: string | null;
  school: string | null;
  department: string | null;
  studentId: string | null;
  cardinals: number[];
  memberRole: MemberRole;
  memberStatus: MemberStatus;
  profileImageUrl: string | null;
  bio: string | null;
}

export interface ProfileData {
  profileId?: number;
  name: string;
  bio?: string;
  profileImageUrl?: string;
  headerImageUrl?: string;
  tel?: string;
  email?: string;
  school?: string;
  department?: string;
}

export interface ClubDto {
  id: string;
  name: string;
  schoolName: string;
  description: string;
  profileImageUrl: string;
  memberCount: number;
  cardinals: number[];
  memberRole: MemberRole;
  memberStatus: MemberStatus;
}

export interface ClubListResponse {
  code: number;
  message: string;
  data: ClubDto[];
}

export interface MyPageSummaryUser {
  name: string | null;
  tel: string | null;
  email: string | null;
  school: string | null;
  department: string | null;
  studentId: string | null;
}

export interface MyPageSummaryStats {
  postCount: number;
  attendedSessionCount: number;
}

export interface MyPageUsingProfileClub {
  clubId: string;
  name: string;
}

export interface MyPageAssignableClub {
  clubId: string;
  name: string;
  clubImage: string | null;
  clubMemberNumber: number;
}

export interface MyPageUsingProfile {
  profileId: number;
  name: string;
  profileImageUrl: string | null;
  headerImageUrl: string | null;
  bio: string | null;
  clubs: MyPageUsingProfileClub[];
}

export interface MyPageActivityClub extends ClubDto {
  currentProfile: MyPageUsingProfile | null;
}

export interface MyPageCurrentProfile {
  profileId: number;
  name: string;
  profileImageUrl: string | null;
  headerImageUrl: string | null;
  bio: string | null;
}

export interface MyPageSummary {
  user: MyPageSummaryUser;
  stats: MyPageSummaryStats;
  usingProfiles: MyPageUsingProfile[];
  currentProfile: MyPageCurrentProfile | null;
}

export interface MyClubMemberSummary {
  userId: number;
  name: string;
  cardinals: number[];
  role: MemberRole;
}

export interface MyPageClubOption {
  id: string;
  name: string;
  description: string;
  profileImageUrl: string | null;
  memberCount: number;
}

export interface MyPagePostItem {
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

export interface MyPageAttendedSessionItem {
  attendanceId: number;
  clubId: string;
  clubName: string;
  sessionId: number;
  sessionTitle: string;
  cardinal: number;
  start: string;
  end: string;
  status: string;
}
