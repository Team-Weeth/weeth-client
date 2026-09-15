import type { MemberStatus } from '@/types/admin/member';

export type PenaltyType = 'PENALTY' | 'WARNING';

// 두 정렬 모두 서버의 내림차순 값을 사용한다.
export type PenaltySortBy = 'CARDINAL_DESC' | 'PENALTY_DESC';

export interface PenaltyMember {
  /** userId (페널티 부여 요청의 userIds에 그대로 쓴다) */
  id: string;
  /** 페널티 상세 조회 경로에 쓰는 동아리 멤버 id */
  clubMemberId: number;
  name: string;
  introduction: string;
  position: string;
  department: string;
  penaltyCount: number;
  /** 'YYYY-MM-DD', 페널티 이력이 없으면 null */
  recentPenaltyAt: string | null;
  /** 활동기수 전체, e.g. "1, 2" */
  cardinal: string;
  status: MemberStatus;
  profileImageUrl: string | null;
}

export interface PenaltyRecordDraft {
  type: PenaltyType;
  score: number;
  /** 선택된 멤버 id 목록 (멤버 리스트 체크박스 선택과 동일한 상태) */
  memberIds: string[];
  reason: string;
}

/** 멤버 한 명에게 부여된 페널티 한 건 */
export interface PenaltyRecord {
  /** penaltyId — 수정/삭제 요청에 그대로 쓴다 */
  id: number;
  cardinal?: number;
  type: PenaltyType;
  score: number;
  reason: string;
  /** 'YYYY-MM-DD' */
  createdAt: string;
}
