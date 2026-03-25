'use client';

import React, { useState } from 'react';

import { AdminChangeIcon, AdminMeatballIcon } from '@/assets/icons/admin';
import {
  Icon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import type { Member } from '@/types/admin/member';
import {
  COLUMNS,
  MOCK_MEMBERS,
  SORT_LABEL,
  STATUS_BAR_COLOR,
  STATUS_LEGEND,
  sortMembers,
  type SortBy,
} from '@/constants/admin/memberTable.constants';

interface MemberTableProps extends React.HTMLAttributes<HTMLDivElement> {
  members: Member[];
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  onMemberAction?: (member: Member) => void;
}

function MemberTable({
  className,
  members,
  selectedIds: controlledSelectedIds,
  onSelectionChange,
  onMemberAction,
  ...props
}: MemberTableProps) {
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortBy>('generation');

  const selectedIds = controlledSelectedIds ?? internalSelectedIds;
  const setSelectedIds = onSelectionChange ?? setInternalSelectedIds;

  const sortedMembers = sortMembers(members, sortBy);

  const isAllSelected = selectedIds.size === members.length;
  const isIndeterminate = selectedIds.size > 0 && !isAllSelected;

  const toggleAll = () => {
    setSelectedIds(isAllSelected ? new Set() : new Set(members.map((m) => m.id)));
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
    setSortBy((prev) => (prev === 'generation' ? 'name' : 'generation'));
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
                  aria-label="전체 멤버 선택"
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
                    aria-label={`${member.name} ${member.studentId} 선택`}
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

export { MemberTable };
