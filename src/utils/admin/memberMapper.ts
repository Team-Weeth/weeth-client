import type { ClubMember, ClubMemberRole, Member } from '@/types/admin/member';
import { formatCompactDateDisplay } from '@/utils/shared/date';

export const ROLE_MAP: Record<ClubMemberRole, string> = {
  USER: '부원',
  ADMIN: '운영진',
  LEAD: '리더',
};

export function toMember(cm: ClubMember): Member {
  return {
    id: String(cm.userId),
    clubMemberId: cm.clubMemberId,
    name: cm.name ?? '',
    email: cm.email ?? '',
    department: cm.department ?? '',
    studentId: cm.studentId ?? '',
    phone: cm.tel ?? '',
    position: ROLE_MAP[cm.memberRole],
    memberRole: cm.memberRole,
    cardinal: cm.cardinals?.join(', ') ?? '',
    attendance: cm.attendanceCount ?? 0,
    absence: cm.absenceCount ?? 0,
    attendanceRate: cm.attendanceRate ?? 0,
    penaltyCount: cm.penaltyCount ?? 0,
    status: cm.memberStatus,
    profileImageUrl: cm.profileImageUrl ?? null,
    bio: cm.bio ?? null,
    joinedAt: formatJoinedAt(cm.joinedAt),
  };
}

/** ISO 문자열('2026-07-18T…')에서 날짜만 떼어 '2026.07.18'로 만든다. */
function formatJoinedAt(joinedAt: string | null | undefined) {
  if (!joinedAt) return null;

  return formatCompactDateDisplay(joinedAt.split('T')[0]);
}
