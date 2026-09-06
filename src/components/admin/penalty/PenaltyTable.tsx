'use client';

import { SelectionCheckbox } from '@/components/admin/SelectionCheckbox';
import { TablePagination } from '@/components/admin/TablePagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  PENALTY_MEMBERS_PER_PAGE,
  PENALTY_TABLE_COLUMNS,
} from '@/constants/admin/penaltyTable.constants';
import { useTableSelection } from '@/hooks/admin';
import { cn } from '@/lib/cn';
import type { PenaltyMember } from '@/types/admin/penalty';
import { PenaltyTableRow } from './PenaltyTableRow';

interface PenaltyTableProps extends React.HTMLAttributes<HTMLDivElement> {
  members: PenaltyMember[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onOpenDetail: (member: PenaltyMember) => void;
}

function PenaltyTable({
  className,
  members,
  selectedIds,
  onSelectionChange,
  onOpenDetail,
  ...props
}: PenaltyTableProps) {
  const {
    currentItems: currentPageMembers,
    currentPage,
    totalPages,
    isAllSelected,
    isPartiallySelected,
    toggleAll,
    toggleOne,
    onPageChange,
  } = useTableSelection({
    items: members,
    perPage: PENALTY_MEMBERS_PER_PAGE,
    selectedIds,
    onSelectionChange,
  });

  return (
    <div className={cn('max-w-full min-w-0', className)} {...props}>
      <div className="border-line overflow-hidden rounded-sm border">
        <Table
          className="border-separate border-spacing-0"
          wrapperClassName="scrollbar-none overflow-auto"
        >
          <TableHeader className="bg-container-neutral-alternative sticky top-0 z-10">
            <TableRow className="h-11 border-0 hover:bg-transparent">
              <TableHead className="h-11 w-16 min-w-16 p-0 pl-300">
                <SelectionCheckbox
                  checked={isAllSelected}
                  partial={isPartiallySelected}
                  ariaLabel="현재 페이지 멤버 전체 선택"
                  checkedLabel="현재 페이지 전체 선택됨"
                  uncheckedLabel="현재 페이지 전체 선택 안됨"
                  uncheckedClassName="text-icon-strong"
                  onClick={toggleAll}
                />
              </TableHead>
              {PENALTY_TABLE_COLUMNS.map((column) => (
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPageMembers.length === 0 ? (
              <TableRow className="bg-container-neutral h-16 border-0 hover:bg-transparent">
                <TableCell
                  colSpan={PENALTY_TABLE_COLUMNS.length + 1}
                  className="typo-body2 text-text-alternative h-16 text-center"
                >
                  검색 결과가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              currentPageMembers.map((member) => (
                <PenaltyTableRow
                  key={member.id}
                  member={member}
                  selected={selectedIds.has(member.id)}
                  onToggle={toggleOne}
                  onOpenDetail={onOpenDetail}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <TablePagination page={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </div>
  );
}

export { PenaltyTable, type PenaltyTableProps };
