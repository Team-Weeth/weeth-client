export type PenaltyType = 'PENALTY' | 'WARNING';

export type PenaltySortBy = 'cardinal' | 'penalty' | 'recent';

export interface PenaltyMember {
  id: string;
  name: string;
  introduction: string;
  position: string;
  department: string;
  penaltyCount: number;
  /** 'YYYY-MM-DD', 페널티 이력이 없으면 null */
  recentPenaltyAt: string | null;
  /** 활동기수 전체, e.g. "1, 2" */
  cardinal: string;
}

export interface PenaltyRecordDraft {
  type: PenaltyType;
  score: number;
  /** 선택된 멤버 id 목록 (멤버 리스트 체크박스 선택과 동일한 상태) */
  memberIds: string[];
  reason: string;
}
