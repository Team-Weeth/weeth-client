'use client';

import React from 'react';
import Image from 'next/image';

import { AdminChangeIcon } from '@/assets/icons';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
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

const COLUMNS = [
  '이름',
  '역할',
  '학과',
  '기수',
  '전화번호',
  '학번',
  '직급',
  '출석',
  '결석',
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
          <Image src={AdminChangeIcon} alt="정렬" width={20} height={20} />
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
            {COLUMNS.map((col) => (
              <TableHead key={col} className="typo-body1 text-text-strong">
                {col}
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
              <TableCell className="typo-body1 text-text-strong">{member.name}</TableCell>
              <TableCell className="typo-body1 text-text-strong">{member.role}</TableCell>
              <TableCell className="typo-body1 text-text-strong">{member.department}</TableCell>
              <TableCell className="typo-body1 text-text-strong">{member.cardinal}</TableCell>
              <TableCell className="typo-body1 text-text-strong">{member.phone}</TableCell>
              <TableCell className="typo-body1 text-text-strong">{member.studentId}</TableCell>
              <TableCell className="typo-body1 text-text-strong">{member.position}</TableCell>
              <TableCell className="typo-body1 text-text-strong">{member.attendance}</TableCell>
              <TableCell className="typo-body1 text-text-strong">{member.absence}</TableCell>
              <TableCell className="w-10">
                <button
                  type="button"
                  className="text-icon-normal flex items-center justify-center"
                  aria-label="더보기"
                  onClick={() => onMemberAction?.(member)}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 10C11.6044 10 11.2178 10.1173 10.8889 10.3371C10.56 10.5568 10.3036 10.8692 10.1522 11.2346C10.0009 11.6001 9.96126 12.0022 10.0384 12.3902C10.1156 12.7781 10.3061 13.1345 10.5858 13.4142C10.8655 13.6939 11.2219 13.8844 11.6098 13.9616C11.9978 14.0387 12.3999 13.9991 12.7654 13.8478C13.1308 13.6964 13.4432 13.44 13.6629 13.1111C13.8827 12.7822 14 12.3956 14 12C14 11.4696 13.7893 10.9609 13.4142 10.5858C13.0391 10.2107 12.5304 10 12 10ZM5 10C4.60444 10 4.21776 10.1173 3.88886 10.3371C3.55996 10.5568 3.30362 10.8692 3.15224 11.2346C3.00087 11.6001 2.96126 12.0022 3.03843 12.3902C3.1156 12.7781 3.30608 13.1345 3.58579 13.4142C3.86549 13.6939 4.22186 13.8844 4.60982 13.9616C4.99778 14.0387 5.39992 13.9991 5.76537 13.8478C6.13082 13.6964 6.44318 13.44 6.66294 13.1111C6.8827 12.7822 7 12.3956 7 12C7 11.4696 6.78929 10.9609 6.41421 10.5858C6.03914 10.2107 5.53043 10 5 10ZM19 10C18.6044 10 18.2178 10.1173 17.8889 10.3371C17.56 10.5568 17.3036 10.8692 17.1522 11.2346C17.0009 11.6001 16.9613 12.0022 17.0384 12.3902C17.1156 12.7781 17.3061 13.1345 17.5858 13.4142C17.8655 13.6939 18.2219 13.8844 18.6098 13.9616C18.9978 14.0387 19.3999 13.9991 19.7654 13.8478C20.1308 13.6964 20.4432 13.44 20.6629 13.1111C20.8827 12.7822 21 12.3956 21 12C21 11.4696 20.7893 10.9609 20.4142 10.5858C20.0391 10.2107 19.5304 10 19 10Z" />
                  </svg>
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
