'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { Member } from '@/types/admin/member';
import { MEMBER_TABLE_COLUMNS } from '@/constants/admin/memberTable.constants';
import { MemberPagination } from './MemberPagination';
import { MemberSelectionCheckbox } from './MemberSelectionCheckbox';
import { MemberTableRow } from './MemberTableRow';

const MEMBERS_PER_PAGE = 10;

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
  const selectedIds = controlledSelectedIds ?? internalSelectedIds;
  const setSelectedIds = onSelectionChange ?? setInternalSelectedIds;
  const [page, setPage] = useState(1);
  const memberListKey = useMemo(() => members.map((member) => member.id).join('|'), [members]);

  useEffect(() => {
    setPage(1);
  }, [memberListKey]);

  const totalPages = Math.max(1, Math.ceil(members.length / MEMBERS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const currentPageMembers = members.slice(
    (currentPage - 1) * MEMBERS_PER_PAGE,
    currentPage * MEMBERS_PER_PAGE,
  );

  const isAllSelected =
    currentPageMembers.length > 0 &&
    currentPageMembers.every((member) => selectedIds.has(member.id));
  const hasAnySelected = currentPageMembers.some((member) => selectedIds.has(member.id));
  const isPartiallySelected = hasAnySelected && !isAllSelected;

  const toggleAll = () => {
    const next = new Set(selectedIds);
    if (isAllSelected) {
      currentPageMembers.forEach((member) => next.delete(member.id));
    } else {
      currentPageMembers.forEach((member) => next.add(member.id));
    }
    setSelectedIds(next);
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

  return (
    <div className={cn('min-w-0', className)} {...props}>
      <div className="border-line overflow-hidden rounded-sm border">
        <Table
          className="w-max min-w-full border-separate border-spacing-0"
          wrapperClassName="overflow-auto"
        >
          <TableHeader className="bg-container-neutral-alternative sticky top-0 z-10">
            <TableRow className="h-11 border-0 hover:bg-transparent">
              <TableHead className="h-11 w-16 min-w-16 p-0 pl-300">
                <MemberSelectionCheckbox
                  checked={isAllSelected}
                  partial={isPartiallySelected}
                  ariaLabel="현재 페이지 멤버 전체 선택"
                  checkedLabel="현재 페이지 전체 선택됨"
                  uncheckedLabel="현재 페이지 전체 선택 안됨"
                  uncheckedClassName="text-icon-strong"
                  onClick={toggleAll}
                />
              </TableHead>
              {MEMBER_TABLE_COLUMNS.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    'typo-caption1 text-text-alternative h-11 px-400 py-300',
                    column.width,
                    'align' in column && column.align,
                  )}
                >
                  {column.label}
                </TableHead>
              ))}
              <TableHead className="h-11 w-[76px] p-0" />
              <TableHead className="h-11 w-11 p-0 pr-700" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPageMembers.map((member) => (
              <MemberTableRow
                key={member.id}
                member={member}
                selected={selectedIds.has(member.id)}
                onToggle={toggleOne}
                onMemberAction={onMemberAction}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <MemberPagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}

export { MemberTable };
