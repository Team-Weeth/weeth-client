import type { ClubMember, ClubMemberRole, Member } from '@/types/admin/member';

const ROLE_MAP: Record<ClubMemberRole, string> = {
  USER: '사용자',
  ADMIN: '관리자',
  LEAD: '리더',
};

export function toMember(cm: ClubMember): Member {
  return {
    id: String(cm.userId),
    clubMemberId: cm.clubMemberId,
    name: cm.name ?? '',
    email: cm.email ?? '',
    role: '',
    department: cm.department ?? '',
    studentId: cm.studentId ?? '',
    phone: cm.tel ?? '',
    position: ROLE_MAP[cm.memberRole],
    memberRole: cm.memberRole,
    cardinal: cm.cardinals?.join(', ') ?? '',
    attendance: cm.attendanceCount ?? 0,
    absence: cm.absenceCount ?? 0,
    penaltyCount: cm.penaltyCount ?? 0,
    status: cm.memberStatus,
  };
}
