import { useState } from 'react';

type BottomSheetSnapPoint = number | string | null;

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
  const controlledActiveSnapPoint = activeSnapPoint !== undefined;
  const defaultDrawerActiveSnapPoint = defaultActiveSnapPoint ?? resolvedSnapPoints?.[0] ?? null;
  const isOpen = open ?? defaultOpen ?? false;
  const drawerActiveSnapPoint = controlledActiveSnapPoint
    ? activeSnapPoint
    : (internalActiveSnapPoint ?? (isOpen ? defaultDrawerActiveSnapPoint : null));
  const setDrawerActiveSnapPoint = controlledActiveSnapPoint
    ? setActiveSnapPoint
    : setInternalActiveSnapPoint;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !controlledActiveSnapPoint) {
      setInternalActiveSnapPoint(null);
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
