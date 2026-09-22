'use client';

import Image, { type StaticImageData } from 'next/image';
import CheckIcon from '@/assets/icons/check.svg';
import ThemeAutoImage from '@/assets/image/theme/theme_auto.png';
import ThemeDarkImage from '@/assets/image/theme/theme_dark.png';
import ThemeLightImage from '@/assets/image/theme/theme_light.png';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import type { ThemeMode } from '@/types/theme';

const THEME_MODE_OPTIONS: {
  value: ThemeMode;
  label: string;
  previewImage: StaticImageData;
}[] = [
  { value: 'auto', label: '자동', previewImage: ThemeAutoImage },
  { value: 'light', label: '라이트', previewImage: ThemeLightImage },
  { value: 'dark', label: '다크', previewImage: ThemeDarkImage },
];

interface ThemeModeSelectorProps {
  selectedMode: ThemeMode;
  onSelectMode: (mode: ThemeMode) => void;
  disabled?: boolean;
  className?: string;
  layout?: 'default' | 'mobile-page';
}

function ThemePreviewCard({
  selected,
  option,
}: {
  selected: boolean;
  option: (typeof THEME_MODE_OPTIONS)[number];
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          'tablet:h-[72px] tablet:w-[104px] h-[110px] w-[160px] overflow-hidden rounded-[10px] transition-colors',
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

function ThemeModeSelector({
  selectedMode,
  onSelectMode,
  disabled = false,
  className,
  layout = 'default',
}: ThemeModeSelectorProps) {
  const renderOption = (option: (typeof THEME_MODE_OPTIONS)[number]) => {
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
  };

  if (layout === 'mobile-page') {
    const [autoOption, ...restOptions] = THEME_MODE_OPTIONS;

    return (
      <div className={cn('flex flex-col gap-500 px-0 py-500', className)}>
        <div className="flex justify-center">{renderOption(autoOption)}</div>
        <div className="grid grid-cols-2 gap-x-[6px] gap-y-400">
          {restOptions.map((option) => renderOption(option))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex h-[200px] items-start justify-center gap-4 px-400 py-500', className)}>
      {THEME_MODE_OPTIONS.map((option) => renderOption(option))}
    </div>
  );
}

export { ThemeModeSelector, type ThemeModeSelectorProps, type ThemeMode };
