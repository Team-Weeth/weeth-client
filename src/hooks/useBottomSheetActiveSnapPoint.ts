import { useEffect, useRef, useState } from 'react';

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
  const drawerActiveSnapPoint = controlledActiveSnapPoint
    ? activeSnapPoint
    : internalActiveSnapPoint;
  const setDrawerActiveSnapPoint = controlledActiveSnapPoint
    ? setActiveSnapPoint
    : setInternalActiveSnapPoint;
  const defaultDrawerActiveSnapPoint = defaultActiveSnapPoint ?? resolvedSnapPoints?.[0] ?? null;
  const previousOpenRef = useRef(open ?? defaultOpen ?? false);

  useEffect(() => {
    if (controlledActiveSnapPoint || defaultDrawerActiveSnapPoint === null) return;

    const wasOpen = previousOpenRef.current;
    const isOpen = open ?? defaultOpen ?? false;

    if ((!wasOpen && isOpen) || (isOpen && internalActiveSnapPoint === null)) {
      setInternalActiveSnapPoint(defaultDrawerActiveSnapPoint);
    }

    previousOpenRef.current = isOpen;
  }, [
    controlledActiveSnapPoint,
    defaultDrawerActiveSnapPoint,
    defaultOpen,
    internalActiveSnapPoint,
    open,
  ]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !controlledActiveSnapPoint) {
      setInternalActiveSnapPoint(defaultDrawerActiveSnapPoint);
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
