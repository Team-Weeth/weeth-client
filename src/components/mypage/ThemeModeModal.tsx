'use client';

import { DeleteIcon } from '@/assets/icons';
import { Button, Dialog, DialogContent, DialogTitle, Icon } from '@/components/ui';
import { ThemeModeSelector, type ThemeMode } from './ThemeModeSelector';

interface ThemeModeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMode: ThemeMode;
  onSelectMode: (mode: ThemeMode) => void;
  onConfirm: () => void;
  disabled?: boolean;
}

function ThemeModeModal({
  open,
  onOpenChange,
  selectedMode,
  onSelectMode,
  onConfirm,
  disabled = false,
}: ThemeModeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-[calc(100%-2rem)] min-w-[428px]">
        <div className="flex items-center justify-between pb-400">
          <DialogTitle className="typo-sub1 text-text-strong">화면 모드</DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer p-1"
            aria-label="화면 모드 닫기"
          >
            <Icon src={DeleteIcon} size={24} className="text-icon-normal" />
          </button>
        </div>
        <ThemeModeSelector
          selectedMode={selectedMode}
          onSelectMode={onSelectMode}
          disabled={disabled}
        />

        <div className="flex gap-200">
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            취소
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={onConfirm}
            disabled={disabled}
          >
            완료
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { ThemeModeModal, type ThemeModeModalProps };
