export type MemberStatus = 'approved' | 'pending' | 'banned' | 'left';
export type MemberDetailStatus = 'approved' | 'pending' | 'banned' | 'left';

export interface Member {
  id: string;
  name: string;
  role: string;
  department: string;
  generation: string;
  phone: string;
  studentId: string;
  position: string;
  attendance: number;
  absence: number;
  status: MemberStatus;
}

export interface MemberDetail {
  name: string;
  generation: number;
  status: MemberDetailStatus;
  position: string;
  role: string;
  department: string;
  phone: string;
  studentId: string;
  email: string;
  activeGenerations: string;
  memberStatus: string;
  joinDate: string;
  attendance: number;
  absence: number;
}

// API response types
export type ClubMemberStatus = 'WAITING' | 'ACTIVE' | 'BANNED' | 'LEFT';
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
  memberStatus: ClubMemberStatus;
  memberRole: ClubMemberRole;
  attendanceCount: number;
  absenceCount: number;
  attendanceRate: number;
  penaltyCount: number;
}
