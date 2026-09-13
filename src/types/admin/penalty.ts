import type { MemberStatus } from '@/types/admin/member';

// TODO: 경고(WARNING) 지원 — 상세 조회 응답(PenaltyDetailResponse)에 penaltyType이 없어
// 부여한 경고를 목록에서 페널티와 구분할 수 없다. 백엔드에 필드가 추가되면 활성화한다.
export type PenaltyType = 'PENALTY' | 'WARNING';

// TODO(페널티 정렬): 멤버 목록 API의 sort에 페널티 횟수/최근 페널티일 기준이 없어
// 현재는 기수 정렬(오름/내림)만 지원한다. 백엔드에 PENALTY_COUNT_*, LAST_PENALTY_AT_*
// 정렬 값이 추가되면 옵션을 되살린다.
export type PenaltySortBy = 'CARDINAL_DESC' | 'CARDINAL_ASC';

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
  type: PenaltyType;
  score: number;
  reason: string;
  /** 'YYYY-MM-DD' */
  createdAt: string;
}
