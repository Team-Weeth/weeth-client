'use client';

import React, { useState } from 'react';

import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { Member } from '@/types/admin/member';
import { MEMBER_TABLE_COLUMNS } from '@/constants/admin/memberTable.constants';
import { MemberPagination } from './MemberPagination';
import { MemberSelectionCheckbox } from './MemberSelectionCheckbox';
import { MemberTableRow } from './MemberTableRow';

interface MemberTableProps extends React.HTMLAttributes<HTMLDivElement> {
  members: Member[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  onMemberAction?: (member: Member) => void;
}

function MemberTable({
  className,
  members,
  page,
  totalPages,
  onPageChange,
  selectedIds: controlledSelectedIds,
  onSelectionChange,
  onMemberAction,
  ...props
}: MemberTableProps) {
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(new Set());
  const selectedIds = controlledSelectedIds ?? internalSelectedIds;
  const setSelectedIds = onSelectionChange ?? setInternalSelectedIds;
  const currentPage = Math.min(page, Math.max(totalPages, 1));

  const isAllSelected = members.length > 0 && members.every((member) => selectedIds.has(member.id));
  const hasAnySelected = members.some((member) => selectedIds.has(member.id));
  const isPartiallySelected = hasAnySelected && !isAllSelected;

  const toggleAll = () => {
    const next = new Set(selectedIds);
    if (isAllSelected) {
      members.forEach((member) => next.delete(member.id));
    } else {
      members.forEach((member) => next.add(member.id));
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
      <div className="border-line max-tablet:rounded-none max-tablet:border-x-0 max-tablet:border-b-0 overflow-hidden rounded-sm border">
        <Table
          wrapperClassName="max-tablet:scrollbar-none"
          className="w-max min-w-full border-separate border-spacing-0"
        >
          <TableHeader className="bg-container-neutral-alternative sticky top-0 z-10">
            <TableRow className="max-tablet:h-10 h-11 border-0 hover:bg-transparent">
              <TableHead className="bg-container-neutral-alternative max-tablet:sticky max-tablet:left-0 max-tablet:z-30 max-tablet:first:rounded-none max-tablet:h-10 max-tablet:w-12 max-tablet:min-w-12 max-tablet:pl-200 h-11 w-16 min-w-16 p-0 pl-300">
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
                    'typo-caption1 text-text-alternative max-tablet:first:rounded-none max-tablet:last:rounded-none max-tablet:h-10 h-11 px-400 py-300',
                    column.width,
                    column.id === 'profile' &&
                      'bg-container-neutral-alternative max-tablet:sticky max-tablet:left-12 max-tablet:z-30 max-tablet:w-[132px] max-tablet:min-w-[132px] max-tablet:px-200 max-tablet:after:absolute max-tablet:after:top-0 max-tablet:after:right-[-24px] max-tablet:after:h-full max-tablet:after:w-6 max-tablet:after:bg-[image:var(--member-table-sticky-shadow)] max-tablet:after:content-[""]',
                    'align' in column && column.align,
                  )}
                >
                  {column.id === 'profile' ? (
                    <>
                      <span className="max-tablet:hidden">{column.label}</span>
                      <span className="tablet:hidden">이름</span>
                    </>
                  ) : (
                    column.label
                  )}
                </TableHead>
              ))}
              <TableHead className="h-11 w-[76px] p-0" />
              <TableHead className="h-11 w-11 p-0 pr-700" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
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
        <MemberPagination page={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </div>
  );
}

export { MemberTable };
