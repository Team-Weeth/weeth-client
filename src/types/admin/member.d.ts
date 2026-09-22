import type { ClubPositionOption, MemberPositionOption } from '@/types/admin/memberPosition';

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
  /** 역할 라벨('부원', '운영진'). 동아리가 설정한 포지션은 positionOption이다. */
  position: string;
  /** 지정된 포지션 옵션. 미지정이면 null */
  positionOption: MemberPositionOption | null;
  memberRole: ClubMemberRole;
  attendance: number;
  absence: number;
  attendanceRate: number;
  penaltyCount: number;
  warningCount?: number | null;
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
  warningCount?: number | null;
  /** 마지막 페널티 부여 일시(ISO). 이력이 없으면 null */
  lastPenaltyAt: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  joinedAt: string | null;
  /** 지정된 포지션 옵션. 미지정이면 null */
  position: ClubPositionOption | null;
}
