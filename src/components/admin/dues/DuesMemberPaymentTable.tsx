'use client';

import { useState } from 'react';

import { ArrowRightIcon, CheckIcon, SearchIcon } from '@/assets/icons';
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

type PaymentStatus = 'paid' | 'unpaid';
type FilterType = 'all' | 'paid' | 'unpaid';

interface DuesMember {
  id: number;
  name: string;
  major: string;
  phone: string;
  status: PaymentStatus;
  avatarInitial?: string;
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  if (status === 'paid') {
    return (
      <span className="typo-caption1 bg-brand-primary/10 text-brand-primary inline-flex h-6 items-center justify-center rounded-[5px] px-200 py-100 whitespace-nowrap">
        완료
      </span>
    );
  }
  return (
    <span className="typo-caption1 bg-state-error/10 text-state-error inline-flex h-6 items-center justify-center rounded-[5px] px-200 py-100 whitespace-nowrap">
      미납
    </span>
  );
}

const COLUMNS = [
  { key: 'select', label: '선택', className: 'w-[88px]' },
  { key: 'name', label: '이름', className: 'min-w-32' },
  { key: 'major', label: '학과', className: 'min-w-32' },
  { key: 'phone', label: '연락처', className: 'w-[148px]' },
  { key: 'status', label: '납부 현황', className: 'w-32' },
  { key: 'action', label: '', className: 'w-[109px]' },
] as const;

interface DuesMemberPaymentTableProps extends React.HTMLAttributes<HTMLDivElement> {
  members: DuesMember[];
  onViewMember?: (member: DuesMember) => void;
  selectedIds: Set<number>;
  onSelectionChange: (ids: Set<number>) => void;
}

function DuesMemberPaymentTable({
  className,
  members,
  onViewMember,
  selectedIds,
  onSelectionChange,
  ...props
}: DuesMemberPaymentTableProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortUnpaidFirst, setSortUnpaidFirst] = useState(false);

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

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
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
                onClick={() => setActiveFilter(f.key)}
                className={cn(
                  'typo-button2 min-w-10 shrink-0 cursor-pointer rounded-[10px] px-400 py-200 transition-colors',
                  activeFilter === f.key
                    ? 'bg-button-neutral text-text-strong'
                    : 'border-line text-text-normal hover:bg-container-neutral-interaction border',
                )}
              >
                {f.label} {f.count}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSortUnpaidFirst((prev) => !prev)}
            className={cn(
              'typo-button2 min-w-10 shrink-0 cursor-pointer rounded-[10px] px-400 py-200 transition-colors',
              sortUnpaidFirst
                ? 'bg-button-neutral text-text-strong'
                : 'border-line text-text-normal hover:bg-container-neutral-interaction border',
            )}
          >
            {sortUnpaidFirst ? '이름 순' : '미납 순'}
          </button>
        </div>

        {/* 검색바 */}
        <div className="bg-container-neutral-alternative relative h-[48px] w-full max-w-[339px] overflow-hidden rounded-sm">
          <div className="text-icon-alternative absolute top-1/2 left-400 -translate-y-1/2">
            <Icon src={SearchIcon} alt="" size={24} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="이름으로 검색하기"
            className="typo-body2 placeholder:text-text-alternative text-text-strong h-full w-full bg-transparent pr-400 pl-[52px] outline-none"
          />
        </div>

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
              {filtered.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="py-700 text-center">
                    <span className="typo-body2 text-text-alternative">
                      해당하는 부원이 없습니다.
                    </span>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((member) => (
                  <TableRow
                    key={member.id}
                    className="border-line hover:bg-container-neutral-interaction border-t"
                  >
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => toggleSelect(member.id)}
                        aria-label={selectedIds.has(member.id) ? '선택 해제' : '선택'}
                        className="flex cursor-pointer items-center justify-center"
                      >
                        <div
                          className={cn(
                            'flex h-4 w-4 items-center justify-center rounded-[3px] border transition-colors',
                            selectedIds.has(member.id)
                              ? 'border-brand-primary bg-brand-primary'
                              : 'border-button-neutral',
                          )}
                        >
                          {selectedIds.has(member.id) && <Icon src={CheckIcon} alt="" size={10} />}
                        </div>
                      </button>
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
                    <TableCell className="typo-body2 text-text-strong">{member.phone}</TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={member.status} />
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => onViewMember?.(member)}
                        className="text-text-alternative hover:text-text-normal typo-button2 flex cursor-pointer items-center gap-100 transition-colors"
                      >
                        <span>멤버정보</span>
                        <Icon src={ArrowRightIcon} alt="" size={12} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
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
