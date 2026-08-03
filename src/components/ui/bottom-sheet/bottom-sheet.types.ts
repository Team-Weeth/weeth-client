import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface BottomSheetProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  expandable?: boolean;
  initialSnapHeight?: number;
  topGap?: number;
  snapPoints?: (number | string)[];
  defaultActiveSnapPoint?: number | string | null;
  activeSnapPoint?: number | string | null;
  setActiveSnapPoint?: (snapPoint: number | string | null) => void;
  closeThreshold?: number;
  scrollLockTimeout?: number;
  title?: string;
  header?: ReactNode;
  footer?: ReactNode;
  showCancelButton?: boolean;
  cancelLabel?: string;
  onCancel?: () => void;
  className?: string;
  overlayClassName?: string;
  handleClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
}

interface BottomSheetActionItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  destructive?: boolean;
  disabled?: boolean;
}

export type { BottomSheetProps, BottomSheetActionItemProps };
