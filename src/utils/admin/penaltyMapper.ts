import type { ClubMember } from '@/types/admin/member';
import type { AdminPenaltyDetail } from '@/types/api/admin/penalty';
import type { PenaltyMember, PenaltyRecord } from '@/types/admin/penalty';
import { ROLE_MAP } from '@/utils/admin/memberMapper';

/** 멤버 목록 응답을 페널티 표가 쓰는 형태로 바꾼다. */
export function toPenaltyMember(cm: ClubMember): PenaltyMember {
  return {
    id: String(cm.userId),
    clubMemberId: cm.clubMemberId,
    name: cm.name ?? '',
    introduction: cm.bio ?? '',
    // TODO: 파트(백엔드/프론트엔드 등)가 서버에 없어 동아리 권한으로 대체한다.
    position: ROLE_MAP[cm.memberRole],
    department: cm.department ?? '',
    penaltyCount: cm.penaltyCount ?? 0,
    recentPenaltyAt: toPenaltyDate(cm.lastPenaltyAt),
    cardinal: cm.cardinals?.join(', ') ?? '',
    status: cm.memberStatus,
    profileImageUrl: cm.profileImageUrl ?? null,
  };
}

/** 페널티 상세 응답 한 건을 상세 모달 표가 쓰는 형태로 바꾼다. */
export function toPenaltyRecord(detail: AdminPenaltyDetail): PenaltyRecord {
  return {
    id: detail.penaltyId,
    // TODO: 응답에 penaltyType이 없어 전부 페널티로 취급한다. 경고 지원 시 서버 값을 쓴다.
    type: 'PENALTY',
    score: detail.score,
    reason: detail.penaltyDescription,
    createdAt: toPenaltyDate(detail.time) ?? '',
  };
}

/** ISO 일시('2026-07-18T01:00:00')에서 날짜만 떼어낸다. */
function toPenaltyDate(value: string | null | undefined) {
  if (!value) return null;

  return value.split('T')[0];
}
