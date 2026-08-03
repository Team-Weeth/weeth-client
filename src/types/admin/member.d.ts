export type MemberStatus = 'ACTIVE' | 'BANNED' | 'LEFT';

export interface Member {
  id: string;
  clubMemberId: number;
  name: string;
  email: string;
  department: string;
  cardinal: string; // 활동기수 전체, e.g. "1, 2"
  phone: string;
  studentId: string;
  position: string;
  memberRole: ClubMemberRole;
  attendance: number;
  absence: number;
  attendanceRate: number;
  penaltyCount: number;
  status: MemberStatus;
  profileImageUrl: string | null;
  bio: string | null;
  joinedAt: string | null;
}

// API response types
export type ClubMemberRole = 'USER' | 'ADMIN' | 'LEAD';

export interface ClubMember {
  userId: number;
  clubMemberId: number;
  name: string;
  email: string;
  tel: string;
  school: string | null;
  department: string | null;
  studentId: string | null;
  cardinals: number[];
  memberStatus: MemberStatus;
  memberRole: ClubMemberRole;
  attendanceCount: number;
  absenceCount: number;
  attendanceRate: number;
  penaltyCount: number;
  profileImageUrl: string | null;
  bio: string | null;
  joinedAt: string | null;
}
