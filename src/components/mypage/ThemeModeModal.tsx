'use client';

import Image, { type StaticImageData } from 'next/image';
import { CheckIcon, DeleteIcon } from '@/assets/icons';
import ThemeAutoImage from '@/assets/image/theme/theme_auto.png';
import ThemeDarkImage from '@/assets/image/theme/theme_dark.png';
import ThemeLightImage from '@/assets/image/theme/theme_light.png';
import { Button, Dialog, DialogContent, DialogTitle, Icon } from '@/components/ui';
import { cn } from '@/lib/cn';

type ThemeMode = 'auto' | 'light' | 'dark';

interface ThemeModeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMode: ThemeMode;
  onSelectMode: (mode: ThemeMode) => void;
  onConfirm: () => void;
  disabled?: boolean;
}

const THEME_OPTIONS: {
  value: ThemeMode;
  label: string;
  previewImage: StaticImageData;
}[] = [
  {
    value: 'auto',
    label: '자동',
    previewImage: ThemeAutoImage,
  },
  {
    value: 'light',
    label: '라이트',
    previewImage: ThemeLightImage,
  },
  {
    value: 'dark',
    label: '다크',
    previewImage: ThemeDarkImage,
  },
];

function ThemePreviewCard({
  selected,
  option,
}: {
  selected: boolean;
  option: (typeof THEME_OPTIONS)[number];
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          'h-[72px] w-[104px] overflow-hidden rounded-[10px] transition-colors',
          selected ? 'ring-button-primary ring-2' : 'ring-0',
        )}
      >
        <Image
          src={option.previewImage}
          alt={`${option.label} 테마 미리보기`}
          className="h-full w-full rounded-[10px] object-cover"
        />
      </div>

      <span className={cn('typo-button2', selected ? 'text-text-normal' : 'text-text-alternative')}>
        {option.label}
      </span>

      <div
        aria-hidden="true"
        className={cn(
          'flex size-5 items-center justify-center rounded-full border-[2px]',
          selected
            ? 'border-button-primary bg-button-primary'
            : 'border-icon-alternative bg-transparent',
        )}
      >
        {selected && <Icon src={CheckIcon} size={14} className="text-white" />}
      </div>
    </div>
  );
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

        <div className="flex h-[200px] items-start justify-center gap-4 px-400 py-500">
          {THEME_OPTIONS.map((option) => {
            const selected = selectedMode === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelectMode(option.value)}
                className="cursor-pointer disabled:cursor-not-allowed"
                disabled={disabled}
              >
                <ThemePreviewCard option={option} selected={selected} />
              </button>
            );
          })}
        </div>

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
