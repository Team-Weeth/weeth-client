'use client';

import { flushSync } from 'react-dom';
import { buildCalendarCells } from '@/utils/shared/calendar';
import { useCalendarDayPopup, type PopupState } from '@/hooks/useCalendarDayPopup';
import type { CalendarCell } from '@/utils/shared/calendar';

interface UseCalendarGridInteractionParams {
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  selectedDate?: string | null;
  onSelectDate?: (date: string) => void;
  onCrossMonthDateClick?: (dateStr: string, year: number, month: number) => void;
}

interface UseCalendarGridInteractionResult {
  isPopupVisible: boolean;
  popupState: PopupState | null;
  closePopup: () => void;
  handleCellClick: (
    cell: CalendarCell,
    row: number,
    col: number,
    totalRows: number,
    e: React.MouseEvent<HTMLDivElement>,
  ) => void;
}

function useCalendarGridInteraction({
  wrapperRef,
  selectedDate,
  onSelectDate,
  onCrossMonthDateClick,
}: UseCalendarGridInteractionParams): UseCalendarGridInteractionResult {
  const { isPopupVisible, popupState, openPopup, closePopup } = useCalendarDayPopup(
    wrapperRef,
    selectedDate,
  );

  const handleCellClick = (
    cell: CalendarCell,
    row: number,
    col: number,
    totalRows: number,
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (!cell.isCurrentMonth) {
      if (!onCrossMonthDateClick) return;
      flushSync(() => {
        onCrossMonthDateClick(cell.dateStr, cell.year, cell.month);
      });
      // flushSync 이후 DOM은 새 달로 재렌더링됨.
      // 새 달의 셀 element를 직접 쿼리해 위치를 계산한다.
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const newCellEl = wrapper.querySelector(
        `[data-calendar-cell="${cell.dateStr}"]`,
      ) as HTMLElement | null;
      if (!newCellEl) return;
      const newCells = buildCalendarCells(cell.year, cell.month);
      const newIndex = newCells.findIndex((c) => c.dateStr === cell.dateStr);
      if (newIndex === -1) return;
      const newCol = newIndex % 7;
      const newRow = Math.floor(newIndex / 7);
      const newTotalRows = newCells.length / 7;
      const [, m, d] = cell.dateStr.split('-');
      openPopup({
        dateStr: cell.dateStr,
        formattedDate: `${Number(m)}월 ${Number(d)}일`,
        row: newRow,
        col: newCol,
        totalRows: newTotalRows,
        wRect: wrapper.getBoundingClientRect(),
        cRect: newCellEl.getBoundingClientRect(),
      });
      return;
    }

    const isPopupOpenForThisDate = isPopupVisible && popupState?.dateStr === cell.dateStr;

    if (isPopupOpenForThisDate) {
      onSelectDate?.(cell.dateStr);
      closePopup();
      return;
    }

    if (selectedDate !== cell.dateStr) {
      onSelectDate?.(cell.dateStr);
    }

    const wrapper = wrapperRef.current;
    const cellEl = e.currentTarget;

    if (wrapper) {
      const [, m, d] = cell.dateStr.split('-');
      openPopup({
        dateStr: cell.dateStr,
        formattedDate: `${Number(m)}월 ${Number(d)}일`,
        row,
        col,
        totalRows,
        wRect: wrapper.getBoundingClientRect(),
        cRect: cellEl.getBoundingClientRect(),
      });
    }
  };

  return { isPopupVisible, popupState, closePopup, handleCellClick };
}

export { useCalendarGridInteraction };
