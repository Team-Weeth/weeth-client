import type { ClubMember, ClubMemberRole, ClubMemberStatus, Member, MemberDetail, MemberStatus } from '@/types/admin/member';

const STATUS_MAP: Record<ClubMemberStatus, MemberStatus> = {
  ACTIVE: 'approved',
  WAITING: 'pending',
  BANNED: 'banned',
  LEFT: 'left',
};

const ROLE_MAP: Record<ClubMemberRole, string> = {
  USER: '사용자',
  ADMIN: '관리자',
  LEAD: '리더',
};

export function toMember(cm: ClubMember): Member {
  return {
    id: String(cm.userId),
    name: cm.name,
    role: '',
    department: cm.department,
    generation: cm.cardinals.join('.') + (cm.cardinals.length ? '.' : ''),
    phone: cm.tel,
    studentId: cm.studentId,
    position: ROLE_MAP[cm.memberRole],
    attendance: cm.attendanceCount,
    absence: cm.absenceCount,
    status: STATUS_MAP[cm.memberStatus],
  };
}

export function toMemberDetail(m: Member): MemberDetail {
  return {
    name: m.name,
    generation: parseInt(m.generation.split('.')[0], 10),
    status: m.status,
    position: m.position,
    role: m.role,
    department: m.department,
    phone: m.phone,
    studentId: m.studentId,
    email: '',
    activeGenerations: m.generation,
    memberStatus: '',
    joinDate: '',
    attendance: m.attendance,
    absence: m.absence,
  };
}
