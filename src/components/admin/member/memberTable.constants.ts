import type { Member, MemberStatus } from '@/types/admin/member';

export const MOCK_MEMBERS: Member[] = [
  {
    id: '1',
    name: '김위드니',
    role: '프론트엔드',
    department: '컴퓨터공학과',
    cardinal: '4.3.2.1.',
    phone: '01000009999',
    studentId: '202036123',
    position: '사용자',
    attendance: 12,
    absence: 12,
    penalty: 12,
    warning: 0,
    status: 'approved',
  },
  {
    id: '2',
    name: '김위드니',
    role: '프론트엔드',
    department: '미디어커뮤니케이션학과',
    cardinal: '8.7.6.5.4.3.2.1.',
    phone: '01000009999',
    studentId: '202036123',
    position: '사용자',
    attendance: 12,
    absence: 12,
    penalty: 12,
    warning: 0,
    status: 'pending',
  },
  {
    id: '3',
    name: '김위드니',
    role: '디자인',
    department: '시각디자인학과',
    cardinal: '3',
    phone: '01000009999',
    studentId: '202036123',
    position: '관리자',
    attendance: 12,
    absence: 12,
    penalty: 12,
    warning: 0,
    status: 'banned',
  },
  {
    id: '4',
    name: '김위드니',
    role: '백엔드',
    department: '소프트웨어학과',
    cardinal: '5.4.3.',
    phone: '01011112222',
    studentId: '202112345',
    position: '사용자',
    attendance: 12,
    absence: 12,
    penalty: 12,
    warning: 0,
    status: 'approved',
  },
  {
    id: '5',
    name: '김위드니',
    role: '기획',
    department: '경영학과',
    cardinal: '6.5.',
    phone: '01033334444',
    studentId: '202298765',
    position: '사용자',
    attendance: 12,
    absence: 12,
    penalty: 12,
    warning: 0,
    status: 'pending',
  },
];

export const STATUS_BAR_COLOR: Record<MemberStatus, string> = {
  approved: 'bg-brand-primary',
  pending: 'bg-state-caution',
  banned: 'bg-state-error',
};

export const COLUMNS: { label: string; key: keyof Member }[] = [
  { label: '이름', key: 'name' },
  { label: '역할', key: 'role' },
  { label: '학과', key: 'department' },
  { label: '기수', key: 'cardinal' },
  { label: '전화번호', key: 'phone' },
  { label: '학번', key: 'studentId' },
  { label: '직급', key: 'position' },
  { label: '출석', key: 'attendance' },
  { label: '결석', key: 'absence' },
];

export const STATUS_LEGEND = [
  { label: '승인 완료', color: 'bg-brand-primary' },
  { label: '대기 중', color: 'bg-state-caution' },
  { label: '추방', color: 'bg-state-error' },
] as const;

export type SortBy = 'cardinal' | 'name';

export const SORT_LABEL: Record<SortBy, string> = {
  cardinal: '기수 순',
  name: '이름순',
};

export function sortMembers(members: Member[], sortBy: SortBy): Member[] {
  return [...members].sort((a, b) => {
    if (sortBy === 'cardinal') {
      const aNum = parseInt(a.cardinal.split('.')[0], 10);
      const bNum = parseInt(b.cardinal.split('.')[0], 10);
      return bNum - aNum;
    }
    return a.name.localeCompare(b.name, 'ko');
  });
}
