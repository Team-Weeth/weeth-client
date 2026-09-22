'use client';

interface UseTableSelectionParams<T extends { id: string }> {
  /** 현재 페이지에 보이는 항목만. 페이지네이션은 호출부에서 관리한다. */
  items: T[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

/**
 * 어드민 테이블의 "현재 페이지 행 선택" 상태를 계산한다.
 * 전체 선택은 넘겨받은 items(= 현재 페이지)에만 적용된다.
 */
function useTableSelection<T extends { id: string }>({
  items,
  selectedIds,
  onSelectionChange,
}: UseTableSelectionParams<T>) {
  const isAllSelected = items.length > 0 && items.every((item) => selectedIds.has(item.id));
  const hasAnySelected = items.some((item) => selectedIds.has(item.id));
  const isPartiallySelected = hasAnySelected && !isAllSelected;

  const toggleAll = () => {
    const next = new Set(selectedIds);
    if (isAllSelected) {
      items.forEach((item) => next.delete(item.id));
    } else {
      items.forEach((item) => next.add(item.id));
    }
    onSelectionChange(next);
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onSelectionChange(next);
  };

  return {
    isAllSelected,
    isPartiallySelected,
    toggleAll,
    toggleOne,
  };
}

export { useTableSelection, type UseTableSelectionParams };
