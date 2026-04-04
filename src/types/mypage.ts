export type MemberRole = 'USER' | 'ADMIN';
export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';

export interface MyMember {
  userId: number;
  clubMemberId: number;
  name: string;
  email: string;
  tel: string;
  school: string;
  department: string;
  studentId: string;
  cardinals: number[];
  memberRole: MemberRole;
  memberStatus: MemberStatus;
  profileImageUrl: string;
  bio: string;
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
