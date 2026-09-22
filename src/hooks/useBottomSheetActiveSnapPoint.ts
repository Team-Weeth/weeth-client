import { useEffect, useRef, useState } from 'react';

type BottomSheetSnapPoint = number | string | null;
type TimeoutId = ReturnType<typeof setTimeout>;

const BOTTOM_SHEET_CLOSE_ANIMATION_MS = 500;

interface UseBottomSheetActiveSnapPointParams {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  resolvedSnapPoints?: (number | string)[];
  defaultActiveSnapPoint?: BottomSheetSnapPoint;
  activeSnapPoint?: BottomSheetSnapPoint;
  setActiveSnapPoint?: (snapPoint: BottomSheetSnapPoint) => void;
}

function useBottomSheetActiveSnapPoint({
  open,
  defaultOpen,
  onOpenChange,
  resolvedSnapPoints,
  defaultActiveSnapPoint,
  activeSnapPoint,
  setActiveSnapPoint,
}: UseBottomSheetActiveSnapPointParams) {
  const [internalActiveSnapPoint, setInternalActiveSnapPoint] = useState<BottomSheetSnapPoint>(
    defaultActiveSnapPoint ?? null,
  );
  const closeResetTimeoutRef = useRef<TimeoutId | null>(null);
  const controlledActiveSnapPoint = activeSnapPoint !== undefined;
  const defaultDrawerActiveSnapPoint = defaultActiveSnapPoint ?? resolvedSnapPoints?.[0] ?? null;
  const isOpen = open ?? defaultOpen ?? false;
  const drawerActiveSnapPoint = controlledActiveSnapPoint
    ? activeSnapPoint
    : (internalActiveSnapPoint ?? (isOpen ? defaultDrawerActiveSnapPoint : null));
  const setDrawerActiveSnapPoint = controlledActiveSnapPoint
    ? setActiveSnapPoint
    : setInternalActiveSnapPoint;

  const clearCloseResetTimeout = () => {
    if (!closeResetTimeoutRef.current) return;
    clearTimeout(closeResetTimeoutRef.current);
    closeResetTimeoutRef.current = null;
  };

  useEffect(() => clearCloseResetTimeout, []);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      clearCloseResetTimeout();
    }

    if (!nextOpen && !controlledActiveSnapPoint) {
      clearCloseResetTimeout();
      closeResetTimeoutRef.current = setTimeout(() => {
        setInternalActiveSnapPoint(null);
        closeResetTimeoutRef.current = null;
      }, BOTTOM_SHEET_CLOSE_ANIMATION_MS);
    }

    onOpenChange?.(nextOpen);
  };

  const snapPointControlProps =
    controlledActiveSnapPoint || drawerActiveSnapPoint !== null
      ? {
          activeSnapPoint: drawerActiveSnapPoint,
          setActiveSnapPoint: setDrawerActiveSnapPoint,
        }
      : {};

  return {
    handleOpenChange,
    snapPointControlProps,
  };
}

export { useBottomSheetActiveSnapPoint };
export type { BottomSheetSnapPoint };
