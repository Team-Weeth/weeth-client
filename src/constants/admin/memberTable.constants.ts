import type { Member, MemberStatus } from '@/types/admin/member';

export const STATUS_BAR_COLOR: Record<MemberStatus, string> = {
  ACTIVE: 'bg-brand-primary',
  WAITING: 'bg-state-caution',
  BANNED: 'bg-state-error',
  LEFT: 'bg-container-neutral-alternative',
};

export const COLUMNS: { label: string; key: keyof Member }[] = [
  { label: '이름', key: 'name' },
  { label: '학과', key: 'department' },
  { label: '기수', key: 'cardinal' },
  { label: '전화번호', key: 'phone' },
  { label: '학번', key: 'studentId' },
  { label: '역할', key: 'position' },
  { label: '출석', key: 'attendance' },
  { label: '결석', key: 'absence' },
];

export type SortBy = 'cardinal' | 'name';

export const SORT_LABEL: Record<SortBy, string> = {
  cardinal: '기수',
  name: '이름',
};

export function sortMembers(members: Member[], sortBy: SortBy): Member[] {
  return [...members].sort((a, b) => {
    if (sortBy === 'cardinal') {
      return parseInt(b.cardinal, 10) - parseInt(a.cardinal, 10);
    }
    return a.name.localeCompare(b.name, 'ko');
  });
}
