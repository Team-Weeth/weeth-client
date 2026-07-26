'use client';

import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { AdminCheckboxIcon, AdminMeatballIcon, AdminUncheckboxIcon } from '@/assets/icons/admin';
import {
  Avatar,
  AvatarFallback,
  Icon,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import type { Member } from '@/types/admin/member';
import { MEMBER_TABLE_COLUMNS } from '@/constants/admin/memberTable.constants';
import { MemberStatusBadge } from './MemberStatusBadge';

const MEMBERS_PER_PAGE = 10;
const PAGE_WINDOW_SIZE = 5;

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
                <button
                  aria-pressed={isPartiallySelected ? 'mixed' : isAllSelected}
                  aria-label="현재 페이지 멤버 전체 선택"
                  type="button"
                  className="flex cursor-pointer items-center p-300"
                  onClick={toggleAll}
                >
                  {isPartiallySelected ? (
                    <span
                      aria-hidden
                      className="bg-brand-primary flex size-[18px] items-center justify-center rounded-[2px]"
                    >
                      <span className="bg-text-inverse h-0.5 w-2 rounded-full" />
                    </span>
                  ) : (
                    <Icon
                      src={isAllSelected ? AdminCheckboxIcon : AdminUncheckboxIcon}
                      alt={isAllSelected ? '현재 페이지 전체 선택됨' : '현재 페이지 전체 선택 안됨'}
                      size={20}
                      className={isAllSelected ? 'text-brand-primary' : 'text-icon-strong'}
                    />
                  )}
                </button>
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
            {currentPageMembers.map((member) => {
              const cardinals = parseMemberCardinals(member.cardinal);
              const visibleCardinals = cardinals.slice(0, 2);
              const hiddenCardinalCount = Math.max(cardinals.length - 2, 0);

              return (
                <TableRow
                  key={member.id}
                  className={cn(
                    'bg-container-neutral [&>td]:border-line h-16 cursor-pointer border-0 hover:bg-neutral-200 [&:last-child>td]:border-b-0 [&>td]:border-b [&>td]:bg-transparent',
                    selectedIds.has(member.id) &&
                      'bg-container-primary-alternative hover:bg-container-primary-alternative',
                  )}
                  onClick={() => onMemberAction?.(member)}
                >
                  <TableCell className="h-16 w-16 min-w-16 p-0 pl-300">
                    <button
                      aria-pressed={selectedIds.has(member.id)}
                      aria-label={`${member.name} ${member.studentId} 선택`}
                      type="button"
                      className="flex cursor-pointer items-center p-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOne(member.id);
                      }}
                    >
                      <Icon
                        src={selectedIds.has(member.id) ? AdminCheckboxIcon : AdminUncheckboxIcon}
                        alt={selectedIds.has(member.id) ? '선택됨' : '선택 안됨'}
                        size={20}
                        className={
                          selectedIds.has(member.id)
                            ? 'text-brand-primary'
                            : 'text-icon-alternative'
                        }
                      />
                    </button>
                  </TableCell>

                  <TableCell className="h-16 w-[172px] p-0 pr-400">
                    <div className="flex min-w-0 items-center gap-300">
                      <Avatar size={40}>
                        <AvatarFallback />
                      </Avatar>
                      <div className="flex min-w-0 flex-col justify-center gap-0.5">
                        <span className="typo-button2 text-text-normal truncate">
                          {member.name}
                        </span>
                        {/* 자기소개가 없는 경우 '-' 표시. TODO : api 응답에 자기소개 추가되어야 함 */}
                        <span className="typo-caption2 text-text-alternative truncate">-</span>
                      </div>
                    </div>
                  </TableCell>

                  <MemberTextCell className="w-[118px]">{member.position}</MemberTextCell>
                  <MemberTextCell className="w-[190px]">{member.department}</MemberTextCell>
                  <MemberTextCell className="w-[138px]">{member.studentId}</MemberTextCell>
                  <MemberNumberCell>{member.attendance}</MemberNumberCell>
                  <MemberNumberCell>{member.absence}</MemberNumberCell>
                  <MemberNumberCell>{member.penaltyCount}</MemberNumberCell>
                  <MemberNumberCell>0</MemberNumberCell>
                  <MemberTextCell className="w-[98px]">{member.position}</MemberTextCell>
                  <MemberTextCell className="w-[146px]">{member.phone}</MemberTextCell>

                  <TableCell className="h-16 w-[182px] p-0 px-400 py-[7px]">
                    <div className="flex items-center gap-100 overflow-hidden">
                      {visibleCardinals.map((cardinal) => (
                        <CardinalTag key={cardinal}>{formatCardinalLabel(cardinal)}</CardinalTag>
                      ))}
                      {hiddenCardinalCount > 0 && <CardinalTag>+{hiddenCardinalCount}</CardinalTag>}
                    </div>
                  </TableCell>

                  <TableCell className="h-16 w-[76px] p-0 px-400 py-[7px]">
                    <MemberStatusBadge status={member.status} />
                  </TableCell>

                  <TableCell className="h-16 w-11 p-0 pr-700">
                    <button
                      type="button"
                      className="text-icon-normal flex cursor-pointer items-center justify-center rounded-sm p-[10px]"
                      aria-label="더보기"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMemberAction?.(member);
                      }}
                    >
                      <Icon src={AdminMeatballIcon} alt="더보기" size={20} />
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <MemberPagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}

function MemberPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const currentGroup = Math.floor((page - 1) / PAGE_WINDOW_SIZE);
  const startPage = currentGroup * PAGE_WINDOW_SIZE + 1;
  const endPage = Math.min(startPage + PAGE_WINDOW_SIZE - 1, totalPages);
  const pages = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  const canGoPrevious = startPage > 1;
  const canGoNext = endPage < totalPages;

  return (
    <Pagination className="mt-800">
      <PaginationContent className="gap-200">
        <PaginationItem>
          <PaginationLink
            href="#"
            aria-label="이전 페이지"
            onClick={(event) => {
              event.preventDefault();
              if (canGoPrevious) onPageChange(startPage - 1);
            }}
            className={cn(
              'text-icon-alternative size-6 rounded-sm p-0 hover:bg-transparent',
              !canGoPrevious && 'pointer-events-none opacity-40',
            )}
          >
            <ChevronLeftIcon className="size-4" />
          </PaginationLink>
        </PaginationItem>

        <div className="flex items-center gap-100">
          {pages.map((pageNumber) => (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                href="#"
                isActive={pageNumber === page}
                onClick={(event) => {
                  event.preventDefault();
                  onPageChange(pageNumber);
                }}
                className={cn(
                  'typo-button1 size-6 rounded-sm p-0',
                  pageNumber === page
                    ? 'bg-button-neutral text-text-strong hover:bg-button-neutral'
                    : 'text-text-normal hover:bg-container-neutral-interaction',
                )}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          ))}
        </div>

        <PaginationItem>
          <PaginationLink
            href="#"
            aria-label="다음 페이지"
            onClick={(event) => {
              event.preventDefault();
              if (canGoNext) onPageChange(endPage + 1);
            }}
            className={cn(
              'text-icon-alternative size-6 rounded-sm p-0 hover:bg-transparent',
              !canGoNext && 'pointer-events-none opacity-40',
            )}
          >
            <ChevronRightIcon className="size-4" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function parseMemberCardinals(cardinal: string) {
  return cardinal
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatCardinalLabel(cardinal: string) {
  return cardinal.endsWith('기') ? cardinal : `${cardinal}기`;
}

function CardinalTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-container-neutral-alternative text-text-alternative rounded-[5px] px-2.5 py-[5px] text-[14px] leading-5 font-semibold tracking-[var(--letter-spacing)] whitespace-nowrap">
      {children}
    </span>
  );
}

function MemberTextCell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <TableCell className={cn('h-16 p-0 px-400 py-300', className)}>
      <span className="typo-body2 text-text-strong block truncate">{children}</span>
    </TableCell>
  );
}

function MemberNumberCell({ children }: { children: React.ReactNode }) {
  return (
    <TableCell className="h-16 w-12 p-0 px-100 py-300 text-center">
      <span className="typo-body2 text-text-strong">{children}</span>
    </TableCell>
  );
}

export { MemberTable };
