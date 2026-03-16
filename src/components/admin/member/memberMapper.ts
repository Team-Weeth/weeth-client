import type { Member } from './MemberTable';
import type { MemberDetail } from './MemberDetailModal';

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
    email: 'weeth123@gmail.com',
    activeGenerations: m.generation,
    memberStatus: '알럼나이',
    joinDate: '2024.12.03.',
    attendance: m.attendance,
    absence: m.absence,
  };
}
