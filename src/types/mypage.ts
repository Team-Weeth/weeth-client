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
  name: string;
  bio?: string;
  profileImageUrl?: string;
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
