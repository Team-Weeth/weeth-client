'use client';

import { useState } from 'react';

import CheckIcon from '@/assets/icons/check.svg';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/Icon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/cn';
import { formatPhone } from '@/utils/shared';
import { DuesPagination } from '@/components/admin/dues/setup/components/DuesPagination';
import { DuesMember, FilterType, PaymentStatus } from '@/types/admin/dues';
import { DuesSearchBar } from './DuesSearchBar';
import { TableTabFilter } from './TableTabFilter';

/** 페이지당 부원 수 */
const ITEMS_PER_PAGE = 10;

/** 벌크 액션 대상이 되는(=선택 가능한) 상태. 환불·제외는 처리할 액션이 없어 선택할 수 없다. */
function isSelectableStatus(status: PaymentStatus): boolean {
  return status === 'paid' || status === 'unpaid';
}

const STATUS_BADGE: Record<PaymentStatus, { label: string; className: string }> = {
  paid: { label: '완료', className: 'bg-brand-primary/10 text-brand-primary' },
  unpaid: { label: '미납', className: 'bg-state-error/10 text-state-error' },
  refunded: { label: '환불', className: 'bg-brand-secondary/10 text-brand-secondary' },
  excluded: { label: '제외', className: 'bg-container-neutral-alternative text-text-alternative' },
};

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { label, className } = STATUS_BADGE[status];
  return <span className={cn('typo-caption1 tag-base', className)}>{label}</span>;
}

const COLUMNS = [
  { key: 'select', label: '선택', className: 'w-[64px]' },
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

  const countByStatus = (status: PaymentStatus) =>
    members.filter((m) => m.status === status).length;

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: '전체', count: members.length },
    { key: 'paid', label: '완료', count: countByStatus('paid') },
    { key: 'unpaid', label: '미납', count: countByStatus('unpaid') },
    { key: 'refunded', label: '환불', count: countByStatus('refunded') },
    { key: 'excluded', label: '제외', count: countByStatus('excluded') },
  ];

  const filtered = members
    .filter((m) => activeFilter === 'all' || m.status === activeFilter)
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
    // 환불·제외 대상은 벌크 액션이 없으므로 선택할 수 없다.
    if (!isSelectableStatus(status)) return;
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
        <TableTabFilter
          tabs={filters}
          activeTab={activeFilter}
          onTabChange={handleFilterChange}
          sortLabel={sortUnpaidFirst ? '이름 순' : '미납 순'}
          onSortToggle={handleSortToggle}
        />

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
                    className={cn(
                      col.label && 'typo-body2 text-text-alternative',
                      col.label === '이름' && 'pl-[46px]',
                      col.className,
                    )}
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
                  const isSelectable = isSelectableStatus(member.status);
                  // 선택 불가(환불·제외) 상태이거나, 선택 진행 중이고 현재 선택 상태와 다른 상태의 멤버는 함께 선택할 수 없다.
                  const isDisabled =
                    !isSelectable ||
                    (!isSelected && selectedStatus !== null && member.status !== selectedStatus);
                  return (
                    <TableRow
                      key={member.id}
                      className={cn(
                        'border-line hover:[&>td]:bg-container-neutral-interaction border-t',
                        isSelected && '[&>td]:bg-container-neutral-alternative',
                      )}
                    >
                      <TableCell>
                        {/* disabled 버튼은 title 툴팁이 뜨지 않으므로 span으로 감싸 안내를 노출한다. */}
                        <span
                          title={
                            !isSelectable
                              ? '납부 완료·미납 상태인 부원만 선택할 수 있어요.'
                              : isDisabled
                                ? '납부 상태가 같은 부원끼리만 선택할 수 있어요.'
                                : undefined
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
                                  : 'border-icon-alternative',
                              )}
                            >
                              {isSelected && <Icon src={CheckIcon} alt="" size={10} />}
                            </div>
                          </button>
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-300">
                          <Avatar size={40} colorScheme="line">
                            <AvatarImage
                              key={member.id}
                              src={member.profileImageUrl}
                              alt="avatar"
                              className="object-cover"
                            />
                            <AvatarFallback />
                          </Avatar>
                          <span className="typo-body1 text-text-normal">{member.name}</span>
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
