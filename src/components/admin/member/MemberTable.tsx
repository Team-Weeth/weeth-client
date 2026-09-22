'use client';

import { useClubFeatures } from '@/providers/club-feature-provider';

import React, { useState } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/cn';
import type { Member } from '@/types/admin/member';
import { MEMBER_TABLE_COLUMNS } from '@/constants/admin/memberTable.constants';
import { SelectionCheckbox } from '@/components/admin/SelectionCheckbox';
import { TablePagination } from '@/components/admin/TablePagination';
import { MemberTableRow } from './MemberTableRow';
import { useAdminPositionOptions } from '@/hooks/queries/admin/useAdminPositionQueries';
import { useUpdateMemberPosition } from '@/hooks/mutations/admin/useAdminPositionMutations';
import { useMemberPositionSettingsLink } from './hooks/useMemberPositionSettingsLink';
import { findScrollContainer } from '@/utils/shared/findScrollContainer';

/** 표를 감싼 가장 가까운 스크롤 컨테이너. 없으면 표 래퍼 자신을 돌려준다. */
function getScrollContainer(node: HTMLElement | null) {
  return findScrollContainer(node) ?? node;
}

interface MemberTableProps extends React.HTMLAttributes<HTMLDivElement> {
  fixedHeight?: boolean;
  scrollResetKey?: string;
  showEmptySearchResult?: boolean;
  members: Member[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  onMemberAction?: (member: Member) => void;
  /** 표 안 마지막 행에 붙는 노드. 모바일은 표가 스크롤을 맡으므로 무한 스크롤 센티널이 여기 들어간다. */
  listFooter?: React.ReactNode;
}

function MemberTable({
  fixedHeight = false,
  scrollResetKey,
  showEmptySearchResult = false,
  className,
  members,
  page,
  totalPages,
  onPageChange,
  selectedIds: controlledSelectedIds,
  onSelectionChange,
  onMemberAction,
  listFooter,
  ...props
}: MemberTableProps) {
  const { warningEnabled } = useClubFeatures();
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(new Set());
  const [showStickyShadow, setShowStickyShadow] = useState(false);
  const { data: positionOptions = [] } = useAdminPositionOptions();
  const { mutate: updatePosition } = useUpdateMemberPosition();
  const goToPositionSettings = useMemberPositionSettingsLink();
  const selectedIds = controlledSelectedIds ?? internalSelectedIds;
  const setSelectedIds = onSelectionChange ?? setInternalSelectedIds;
  const currentPage = Math.min(page, Math.max(totalPages, 1));

  // 헤더는 thead가 아니라 th마다 고정한다. 고정 헤더(thead) 안에 고정 열(th)이 들어가는 중첩 sticky는
  // iOS 사파리가 스크롤 중에 위치를 따라가지 못해 표가 흔들린다. 배경도 셀마다 직접 칠해야 한다.
  const stickyHeadCellClass = cn(
    'bg-container-neutral-alternative max-tablet:sticky max-tablet:top-0 max-tablet:z-30',
    fixedHeight && 'tablet:sticky tablet:top-0 tablet:z-30',
  );

  const visibleColumns = MEMBER_TABLE_COLUMNS.filter(
    (column) => column.id !== 'warning' || warningEnabled,
  );
  // 체크박스 열 + 뒤쪽 여백 열 2개까지 더한 값이라 전체 너비로 펼칠 때 쓴다.
  const columnCount = visibleColumns.length + 3;

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

  // 스크롤 주체가 뷰포트 폭에 따라 달라진다. 모바일은 바깥 컨테이너, 데스크톱은 표 래퍼 자신.
  React.useEffect(() => {
    let container: HTMLElement | null = null;
    const handleScroll = () => setShowStickyShadow((container?.scrollLeft ?? 0) > 0);
    const attach = () => {
      const next = getScrollContainer(wrapperRef.current);
      if (next === container) return;
      container?.removeEventListener('scroll', handleScroll);
      container = next;
      container?.addEventListener('scroll', handleScroll, { passive: true });
    };
    attach();
    window.addEventListener('resize', attach);
    return () => {
      window.removeEventListener('resize', attach);
      container?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  React.useEffect(() => {
    const container = getScrollContainer(wrapperRef.current);
    if (container) container.scrollTop = 0;
  }, [scrollResetKey]);

  React.useEffect(() => {
    if (page <= currentPage) return;
    onPageChange(currentPage);
  }, [currentPage, onPageChange, page]);

  return (
    <div
      className={cn(
        'min-w-0',
        // 모바일은 표 래퍼가 직접 가로·세로 스크롤을 맡는다. 스크롤 주체가 표 바깥에 있으면
        // iOS 사파리가 헤더·고정 열의 sticky 위치를 따라가지 못해 표 전체가 같이 움직인다.
        'max-tablet:flex max-tablet:min-h-0 max-tablet:flex-1 max-tablet:flex-col',
        className,
      )}
      {...props}
    >
      <div className="border-line max-tablet:rounded-none max-tablet:border-x-0 max-tablet:border-b-0 max-tablet:min-h-0 max-tablet:flex-1 overflow-hidden rounded-sm border">
        <Table
          wrapperClassName={cn(
            'max-tablet:scrollbar-none max-tablet:h-full max-tablet:overflow-y-auto',
            // 헤더 44px + 멤버 10행 × 64px. 10명 이하는 내용 높이를 그대로 사용한다.
            fixedHeight && members.length > 10 && 'tablet:max-h-[684px] tablet:overflow-y-auto',
          )}
          wrapperProps={{ ref: wrapperRef }}
          className="w-max min-w-full border-separate border-spacing-0"
        >
          <TableHeader className="bg-container-neutral-alternative">
            <TableRow className="max-tablet:h-10 h-11 border-0 hover:bg-transparent">
              <TableHead
                className={cn(
                  stickyHeadCellClass,
                  'max-tablet:left-0 max-tablet:z-40 max-tablet:first:rounded-none max-tablet:h-10 max-tablet:w-12 max-tablet:min-w-12 max-tablet:pl-200 h-11 w-16 min-w-16 p-0 pl-300',
                )}
              >
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
              {visibleColumns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    stickyHeadCellClass,
                    'typo-caption1 text-text-alternative max-tablet:first:rounded-none max-tablet:last:rounded-none max-tablet:h-10 h-11 px-400 py-300',
                    column.width,
                    column.id === 'profile' &&
                      cn(
                        'max-tablet:left-12 max-tablet:z-40 max-tablet:w-28 max-tablet:min-w-28 max-tablet:px-0 px-0',
                        showStickyShadow &&
                          'max-tablet:after:absolute max-tablet:after:top-0 max-tablet:after:right-[-24px] max-tablet:after:h-full max-tablet:after:w-6 max-tablet:after:bg-[image:var(--member-table-sticky-shadow)] max-tablet:after:content-[""]',
                      ),
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
              <TableHead className={cn(stickyHeadCellClass, 'h-11 w-[76px] p-0')} />
              <TableHead className={cn(stickyHeadCellClass, 'h-11 w-11 p-0 pr-700')} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {showEmptySearchResult && members.length === 0 && (
              <TableRow className="bg-container-neutral h-16 border-0 hover:bg-transparent">
                <TableCell
                  colSpan={columnCount}
                  className="typo-body2 text-text-alternative h-16 text-center"
                >
                  검색 결과가 없습니다.
                </TableCell>
              </TableRow>
            )}
            {members.map((member) => (
              <MemberTableRow
                key={member.id}
                member={member}
                positionOptions={positionOptions}
                onPositionChange={(option) =>
                  updatePosition({ clubMemberId: member.clubMemberId, option })
                }
                onAddPosition={goToPositionSettings}
                selected={selectedIds.has(member.id)}
                onToggle={toggleOne}
                onMemberAction={onMemberAction}
                showStickyShadow={showStickyShadow}
              />
            ))}
            {listFooter && (
              <TableRow className="border-0 hover:bg-transparent">
                <TableCell colSpan={columnCount} className="h-px p-0">
                  {listFooter}
                </TableCell>
              </TableRow>
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

export { MemberTable };
