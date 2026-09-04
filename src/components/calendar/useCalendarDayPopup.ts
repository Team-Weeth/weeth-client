'use client';

import { useEffect, useRef, useState } from 'react';
import type { ScheduleDetail } from '@/types/calendar';

interface PopupState {
  dateStr: string;
  formattedDate: string;
  schedules: ScheduleDetail[];
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

interface OpenPopupParams {
  dateStr: string;
  formattedDate: string;
  schedules: ScheduleDetail[];
  row: number;
  col: number;
  totalRows: number;
  wRect: DOMRect;
  cRect: DOMRect;
}

/** Computes absolute popup anchor position relative to the grid wrapper. */
function getPopupAnchor(
  row: number,
  col: number,
  totalRows: number,
  wRect: DOMRect,
  cRect: DOMRect,
): Pick<PopupState, 'top' | 'bottom' | 'left' | 'right'> {
  const isLastRow = row === totalRows - 1;
  const isSecondToLastRow = row === totalRows - 2;
  const isThirdToLastRow = row === totalRows - 3;
  const isTopThirdRow = totalRows === 6 && row === 2;

  const isLastCol = col === 6;
  const isSecondToLastCol = col === 5;
  const isThirdToLastCol = col === 4;
  const isLeftThirdCol = col === 2;

  const vertical = isLastRow
    ? { bottom: 0 as const }
    : !isTopThirdRow && (isSecondToLastRow || isThirdToLastRow)
      ? { bottom: wRect.bottom - cRect.bottom }
      : { top: cRect.top - wRect.top };

  const horizontal =
    isLastCol || (!isLeftThirdCol && (isSecondToLastCol || isThirdToLastCol))
      ? { right: wRect.right - cRect.right }
      : { left: cRect.left - wRect.left };

  return { ...vertical, ...horizontal };
}

function useCalendarDayPopup(
  wrapperRef: React.RefObject<HTMLDivElement | null>,
  selectedDate: string | null | undefined,
) {
  const [popupState, setPopupState] = useState<PopupState | null>(null);

  // Ref that always holds the latest popupState for use inside ResizeObserver callback.
  const popupStateRef = useRef(popupState);
  useEffect(() => {
    popupStateRef.current = popupState;
  });

  const [prevSelectedDate, setPrevSelectedDate] = useState(selectedDate);
  if (prevSelectedDate !== selectedDate) {
    setPrevSelectedDate(selectedDate);
    if (popupState?.dateStr !== selectedDate) {
      setPopupState(null);
    }
  }

  const isPopupVisible = popupState !== null && selectedDate === popupState.dateStr;

  // Recalculate popup position when the grid resizes (window resize, layout shift, etc.).
  useEffect(() => {
    if (!isPopupVisible) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const recalc = () => {
      const state = popupStateRef.current;
      if (!state) return;
      const cellEl = wrapper.querySelector(
        `[data-calendar-cell="${state.dateStr}"]`,
      ) as HTMLElement | null;
      if (!cellEl) return;
      const wRect = wrapper.getBoundingClientRect();
      const cRect = cellEl.getBoundingClientRect();
      setPopupState((prev) =>
        prev
          ? {
              ...prev,
              ...(prev.bottom !== undefined
                ? prev.bottom === 0
                  ? {}
                  : { bottom: wRect.bottom - cRect.bottom }
                : { top: cRect.top - wRect.top }),
              ...(prev.right !== undefined
                ? { right: wRect.right - cRect.right, left: undefined }
                : { left: cRect.left - wRect.left, right: undefined }),
            }
          : null,
      );
    };

    const observer = new ResizeObserver(recalc);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [isPopupVisible, wrapperRef]);

  const openPopup = ({
    dateStr,
    formattedDate,
    schedules,
    row,
    col,
    totalRows,
    wRect,
    cRect,
  }: OpenPopupParams) => {
    setPopupState({
      dateStr,
      formattedDate,
      schedules,
      ...getPopupAnchor(row, col, totalRows, wRect, cRect),
    });
  };

  const closePopup = () => setPopupState(null);

  return { isPopupVisible, popupState, openPopup, closePopup };
}

export { useCalendarDayPopup, type PopupState };
