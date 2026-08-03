import type { ClubMember, ClubMemberRole, Member } from '@/types/admin/member';

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

function formatJoinedAt(joinedAt: string | null | undefined) {
  if (!joinedAt) return null;

  const [date] = joinedAt.split('T');
  const [year, month, day] = date.split('-');

  if (!year || !month || !day) return joinedAt;

  return `${year}.${month}.${day}`;
}
