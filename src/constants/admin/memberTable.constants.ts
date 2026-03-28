import type { Member, MemberStatus } from '@/types/admin/member';

export const MOCK_MEMBERS: Member[] = [
  {
    id: '1',
    name: '김위드니',
    email: 'weeth1@example.com',
    role: '프론트엔드',
    department: '컴퓨터공학과',
    generation: '4, 3, 2, 1',
    phone: '01000009999',
    studentId: '202036123',
    position: '사용자',
    attendance: 12,
    absence: 12,
    penaltyCount: 0,
    status: 'ACTIVE',
  },
  {
    id: '2',
    name: '김위드니',
    email: 'weeth2@example.com',
    role: '프론트엔드',
    department: '미디어커뮤니케이션학과',
    generation: '8, 7, 6, 5, 4, 3, 2, 1',
    phone: '01000009999',
    studentId: '202036123',
    position: '사용자',
    attendance: 12,
    absence: 12,
    penaltyCount: 1,
    status: 'WAITING',
  },
  {
    id: '3',
    name: '김위드니',
    email: 'weeth3@example.com',
    role: '디자인',
    department: '시각디자인학과',
    generation: '3',
    phone: '01000009999',
    studentId: '202036123',
    position: '관리자',
    attendance: 12,
    absence: 12,
    penaltyCount: 0,
    status: 'BANNED',
  },
  {
    id: '4',
    name: '김위드니',
    email: 'weeth4@example.com',
    role: '백엔드',
    department: '소프트웨어학과',
    generation: '5, 4, 3',
    phone: '01011112222',
    studentId: '202112345',
    position: '사용자',
    attendance: 12,
    absence: 12,
    penaltyCount: 0,
    status: 'ACTIVE',
  },
  {
    id: '5',
    name: '김위드니',
    email: 'weeth5@example.com',
    role: '기획',
    department: '경영학과',
    generation: '6, 5',
    phone: '01033334444',
    studentId: '202298765',
    position: '사용자',
    attendance: 12,
    absence: 12,
    penaltyCount: 2,
    status: 'WAITING',
  },
];

export const STATUS_BAR_COLOR: Record<MemberStatus, string> = {
  ACTIVE: 'bg-brand-primary',
  WAITING: 'bg-state-caution',
  BANNED: 'bg-state-error',
  LEFT: 'bg-container-neutral-alternative',
};

export const COLUMNS: { label: string; key: keyof Member }[] = [
  { label: '이름', key: 'name' },
  { label: '역할', key: 'role' },
  { label: '학과', key: 'department' },
  { label: '기수', key: 'generation' },
  { label: '전화번호', key: 'phone' },
  { label: '학번', key: 'studentId' },
  { label: '직급', key: 'position' },
  { label: '출석', key: 'attendance' },
  { label: '결석', key: 'absence' },
];

export const STATUS_LEGEND = [
  { label: 'ACTIVE', color: 'bg-brand-primary' },
  { label: 'WAITING', color: 'bg-state-caution' },
  { label: 'BANNED', color: 'bg-state-error' },
  { label: 'LEFT', color: 'bg-container-neutral-alternative' },
] as const;

export type SortBy = 'generation' | 'name';

export const SORT_LABEL: Record<SortBy, string> = {
  generation: '기수',
  name: '이름',
};

export function sortMembers(members: Member[], sortBy: SortBy): Member[] {
  return [...members].sort((a, b) => {
    if (sortBy === 'generation') {
      return parseInt(b.generation, 10) - parseInt(a.generation, 10);
    }
    return a.name.localeCompare(b.name, 'ko');
  });
}
