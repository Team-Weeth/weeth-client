'use client';

import { useState } from 'react';

import { CheckIcon } from '@/assets/icons';
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
import { formatPhone } from '@/utils/shared';
import { DuesPagination } from '@/components/admin/dues/setup/components';
import { DuesMember, FilterType, PaymentStatus } from '@/types/admin/dues';
import { DuesSearchBar } from './DuesSearchBar';

/** 페이지당 부원 수 */
const ITEMS_PER_PAGE = 10;

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  if (status === 'paid') {
    return (
      <span className="typo-caption1 bg-brand-primary/10 text-brand-primary tag-base">완료</span>
    );
  }
  return <span className="typo-caption1 bg-state-error/10 text-state-error tag-base">미납</span>;
}

const COLUMNS = [
  { key: 'select', label: '선택', className: 'w-[88px]' },
  { key: 'name', label: '이름', className: 'min-w-32' },
  { key: 'major', label: '학과', className: 'min-w-32' },
  { key: 'phone', label: '연락처', className: 'w-[148px]' },
  { key: 'status', label: '납부 현황', className: 'w-32' },
] as const;

interface DuesMemberPaymentTableProps extends React.HTMLAttributes<HTMLDivElement> {
  members: DuesMember[];
  selectedIds: Set<number>;
  onSelectionChange: (ids: Set<number>) => void;
}

function DuesMemberPaymentTable({
  className,
  members,
  selectedIds,
  onSelectionChange,
  ...props
}: DuesMemberPaymentTableProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortUnpaidFirst, setSortUnpaidFirst] = useState(false);
  const [page, setPage] = useState(1);

  const totalCount = members.length;
  const paidCount = members.filter((m) => m.status === 'paid').length;
  const unpaidCount = members.filter((m) => m.status === 'unpaid').length;

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: '전체', count: totalCount },
    { key: 'paid', label: '납부완료', count: paidCount },
    { key: 'unpaid', label: '미납', count: unpaidCount },
  ];

  const filtered = members
    .filter((m) => {
      if (activeFilter === 'paid') return m.status === 'paid';
      if (activeFilter === 'unpaid') return m.status === 'unpaid';
      return true;
    })
    .filter((m) => !searchQuery || m.name.includes(searchQuery))
    .sort((a, b) => {
      if (!sortUnpaidFirst) return 0;
      if (a.status === 'unpaid' && b.status !== 'unpaid') return -1;
      if (a.status !== 'unpaid' && b.status === 'unpaid') return 1;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleFilterChange = (key: FilterType) => {
    setActiveFilter(key);
    setPage(1);
  };

  const handleSortToggle = () => {
    setSortUnpaidFirst((prev) => !prev);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  // 현재 선택된 멤버들의 납부 상태(모두 동일하게 유지된다). 선택이 없으면 null.
  const selectedStatus: PaymentStatus | null =
    selectedIds.size === 0 ? null : (members.find((m) => selectedIds.has(m.id))?.status ?? null);

  const toggleSelect = (id: number, status: PaymentStatus) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      // 첫 선택 상태와 다른 상태는 함께 선택할 수 없다(벌크 액션이 일부에게 무의미해지는 것 방지).
      if (selectedStatus !== null && status !== selectedStatus) return;
      next.add(id);
    }
    onSelectionChange(next);
  };

  return (
    <div
      className={cn('bg-container-neutral flex flex-col gap-600 rounded-lg p-450', className)}
      {...props}
    >
      <span className="typo-h3 text-text-strong">부원별 납부현황</span>

      <div className="flex flex-col gap-400">
        {/* 필터 칩 + 정렬 */}
        <div className="flex flex-wrap items-center justify-between gap-y-200">
          <div className="flex gap-[5px] overflow-x-auto">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => handleFilterChange(f.key)}
                className="typo-button2 border-line text-text-normal hover:bg-container-neutral-interaction min-w-10 shrink-0 cursor-pointer rounded-[10px] border px-400 py-200 transition-colors"
              >
                {f.label} {f.count}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleSortToggle}
            className="typo-button2 border-line text-text-normal hover:bg-container-neutral-interaction min-w-10 shrink-0 cursor-pointer rounded-[10px] border px-400 py-200 transition-colors"
          >
            {sortUnpaidFirst ? '이름 순' : '미납 순'}
          </button>
        </div>

        {/* 검색바 */}
        <DuesSearchBar searchQuery={searchQuery} setSearchQuery={handleSearchChange} />

        {/* 테이블 */}
        <div className="border-line overflow-x-auto rounded-sm border">
          <Table>
            <TableHeader className="bg-container-neutral-alternative">
              <TableRow className="border-line border-b hover:bg-transparent">
                {COLUMNS.map((col) => (
                  <TableHead
                    key={col.key}
                    className={cn(col.label && 'typo-body2 text-text-alternative', col.className)}
                  >
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={COLUMNS.length} className="py-700 text-center">
                    <span className="typo-body2 text-text-alternative">
                      해당하는 부원이 없습니다.
                    </span>
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((member) => {
                  const isSelected = selectedIds.has(member.id);
                  // 선택 진행 중이고, 현재 선택 상태와 다른 상태의 멤버는 함께 선택할 수 없다.
                  const isDisabled =
                    !isSelected && selectedStatus !== null && member.status !== selectedStatus;
                  return (
                    <TableRow
                      key={member.id}
                      className="border-line hover:bg-container-neutral-interaction border-t"
                    >
                      <TableCell>
                        {/* disabled 버튼은 title 툴팁이 뜨지 않으므로 span으로 감싸 안내를 노출한다. */}
                        <span
                          title={
                            isDisabled ? '납부 상태가 같은 부원끼리만 선택할 수 있어요.' : undefined
                          }
                          className="inline-flex"
                        >
                          <button
                            type="button"
                            onClick={() => toggleSelect(member.id, member.status)}
                            disabled={isDisabled}
                            aria-label={isSelected ? '선택 해제' : '선택'}
                            className={cn(
                              'flex items-center justify-center',
                              isDisabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
                            )}
                          >
                            <div
                              className={cn(
                                'flex h-4 w-4 items-center justify-center rounded-[3px] border transition-colors',
                                isSelected
                                  ? 'border-brand-primary bg-brand-primary'
                                  : 'border-button-neutral',
                              )}
                            >
                              {isSelected && <Icon src={CheckIcon} alt="" size={10} />}
                            </div>
                          </button>
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-400">
                          <div className="bg-container-neutral-interaction text-text-alternative typo-caption1 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md">
                            {member.avatarInitial ?? member.name.slice(0, 1)}
                          </div>
                          <span className="typo-body2 text-text-strong min-w-0 truncate">
                            {member.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="typo-body2 text-text-strong">{member.major}</TableCell>
                      <TableCell className="typo-body2 text-text-strong">
                        {formatPhone(member.phone)}
                      </TableCell>
                      <TableCell>
                        <PaymentStatusBadge status={member.status} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <DuesPagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}

export {
  DuesMemberPaymentTable,
  type DuesMemberPaymentTableProps,
  type DuesMember,
  type PaymentStatus,
};
