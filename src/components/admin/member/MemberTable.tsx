'use client';

import React from 'react';

import { AdminChangeIcon, AdminMeatballIcon } from '@/assets/icons';
import { Icon, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { cn } from '@/lib/cn';

type MemberStatus = 'approved' | 'pending' | 'banned';

interface Member {
  id: string;
  name: string;
  role: string;
  department: string;
  cardinal: string;
  phone: string;
  studentId: string;
  position: string;
  attendance: number;
  absence: number;
  penalty: number;
  warning: number;
  status: MemberStatus;
}

const MOCK_MEMBERS: Member[] = [
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

const STATUS_BAR_COLOR: Record<MemberStatus, string> = {
  approved: 'bg-brand-primary',
  pending: 'bg-state-caution',
  banned: 'bg-state-error',
};

const COLUMNS: { label: string; key: keyof Member }[] = [
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

type SortBy = 'cardinal' | 'name';

const STATUS_LEGEND = [
  { label: '승인 완료', color: 'bg-brand-primary' },
  { label: '대기 중', color: 'bg-state-caution' },
  { label: '추방', color: 'bg-state-error' },
] as const;

const SORT_LABEL: Record<SortBy, string> = {
  cardinal: '기수 순',
  name: '이름순',
};

function sortMembers(members: Member[], sortBy: SortBy): Member[] {
  return [...members].sort((a, b) => {
    if (sortBy === 'cardinal') {
      const aNum = parseInt(a.cardinal.split('.')[0], 10);
      const bNum = parseInt(b.cardinal.split('.')[0], 10);
      return bNum - aNum;
    }
    return a.name.localeCompare(b.name, 'ko');
  });
}

interface MemberTableProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  onMemberAction?: (member: Member) => void;
}

function MemberTable({
  className,
  selectedIds: controlledSelectedIds,
  onSelectionChange,
  onMemberAction,
  ...props
}: MemberTableProps) {
  const [internalSelectedIds, setInternalSelectedIds] = React.useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = React.useState<SortBy>('cardinal');

  const selectedIds = controlledSelectedIds ?? internalSelectedIds;
  const setSelectedIds = onSelectionChange ?? setInternalSelectedIds;

  const sortedMembers = sortMembers(MOCK_MEMBERS, sortBy);

  const isAllSelected = selectedIds.size === MOCK_MEMBERS.length;
  const isIndeterminate = selectedIds.size > 0 && !isAllSelected;

  const toggleAll = () => {
    setSelectedIds(isAllSelected ? new Set() : new Set(MOCK_MEMBERS.map((m) => m.id)));
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const toggleSort = () => {
    setSortBy((prev) => (prev === 'cardinal' ? 'name' : 'cardinal'));
  };

  return (
    <div className={cn('flex flex-col gap-600', className)} {...props}>
      <div className="flex items-center">
        <div className="flex items-center gap-400">
          {STATUS_LEGEND.map(({ label, color }) => (
            <span key={label} className="typo-caption2 text-text-strong flex items-center gap-200">
              <span className={cn('size-1', color)} />
              {label}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={toggleSort}
          className="bg-button-neutral typo-button2 text-text-strong ml-300 flex cursor-pointer items-center gap-200 rounded px-200 py-100"
        >
          {SORT_LABEL[sortBy]}
          <Icon src={AdminChangeIcon} alt="정렬" size={20} />
        </button>
      </div>

      <div className="scrollbar-none overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-0 hover:bg-transparent">
              <TableHead className="w-1 min-w-1 p-0" />
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  className="cursor-pointer"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={toggleAll}
                />
              </TableHead>
              {COLUMNS.map(({ label }) => (
                <TableHead key={label} className="typo-body1 text-text-strong">
                  {label}
                </TableHead>
              ))}
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMembers.map((member) => (
              <TableRow key={member.id} className="hover:bg-container-neutral-interaction border-0">
                <TableCell className={cn('w-1 min-w-1 p-0', STATUS_BAR_COLOR[member.status])} />
                <TableCell className="w-12">
                  <input
                    type="checkbox"
                    className="cursor-pointer"
                    checked={selectedIds.has(member.id)}
                    onChange={() => toggleOne(member.id)}
                  />
                </TableCell>
                {COLUMNS.map(({ key, label }) => (
                  <TableCell key={label} className="typo-body1 text-text-strong">
                    {String(member[key])}
                  </TableCell>
                ))}
                <TableCell className="w-10">
                  <button
                    type="button"
                    className="text-icon-normal flex cursor-pointer items-center justify-center"
                    aria-label="더보기"
                    onClick={() => onMemberAction?.(member)}
                  >
                    <Icon src={AdminMeatballIcon} alt="더보기" size={20} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export { MemberTable, MOCK_MEMBERS, type Member, type MemberStatus };
