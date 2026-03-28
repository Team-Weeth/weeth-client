export type MemberStatus = 'WAITING' | 'ACTIVE' | 'BANNED' | 'LEFT';

export interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  generation: string; // 활동기수 전체, e.g. "1, 2"
  phone: string;
  studentId: string;
  position: string;
  attendance: number;
  absence: number;
  penaltyCount: number;
  status: MemberStatus;
}

// API response types
export type ClubMemberRole = 'USER' | 'ADMIN' | 'LEAD';

export interface ClubMember {
  userId: number;
  clubMemberId: number;
  name: string;
  email: string;
  tel: string;
  school: string;
  department: string;
  studentId: string;
  cardinals: number[];
  memberStatus: MemberStatus;
  memberRole: ClubMemberRole;
  attendanceCount: number;
  absenceCount: number;
  attendanceRate: number;
  penaltyCount: number;
}
