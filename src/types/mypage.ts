export type MemberRole = 'USER' | 'ADMIN';
export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';

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
