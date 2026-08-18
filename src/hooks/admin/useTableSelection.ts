'use client';

import { useState } from 'react';

interface UseTableSelectionParams<T extends { id: string }> {
  items: T[];
  perPage: number;
  /** 외부에서 선택 상태를 제어할 때 전달. 생략하면 내부 상태를 사용한다. */
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
}

/**
 * 어드민 테이블의 페이지네이션 + 행 선택 상태를 관리한다.
 * 목록이 바뀌면(검색·필터 등) 페이지는 1로 되돌아간다.
 */
function useTableSelection<T extends { id: string }>({
  items,
  perPage,
  selectedIds: controlledSelectedIds,
  onSelectionChange,
}: UseTableSelectionParams<T>) {
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(new Set());
  const selectedIds = controlledSelectedIds ?? internalSelectedIds;
  const setSelectedIds = onSelectionChange ?? setInternalSelectedIds;

  const itemListKey = items.map((item) => item.id).join('|');
  const [pagination, setPagination] = useState({ itemListKey, page: 1 });
  const page = pagination.itemListKey === itemListKey ? pagination.page : 1;

  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const currentItems = items.slice((currentPage - 1) * perPage, currentPage * perPage);

  const isAllSelected =
    currentItems.length > 0 && currentItems.every((item) => selectedIds.has(item.id));
  const hasAnySelected = currentItems.some((item) => selectedIds.has(item.id));
  const isPartiallySelected = hasAnySelected && !isAllSelected;

  const toggleAll = () => {
    const next = new Set(selectedIds);
    if (isAllSelected) {
      currentItems.forEach((item) => next.delete(item.id));
    } else {
      currentItems.forEach((item) => next.add(item.id));
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

  const onPageChange = (nextPage: number) => {
    setPagination({ itemListKey, page: nextPage });
  };

  return {
    currentItems,
    currentPage,
    totalPages,
    selectedIds,
    isAllSelected,
    isPartiallySelected,
    toggleAll,
    toggleOne,
    onPageChange,
  };
}

export { useTableSelection, type UseTableSelectionParams };
