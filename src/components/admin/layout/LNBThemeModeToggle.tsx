'use client';

import { AdminContrastIcon, AdminDarkIcon, AdminLightIcon } from '@/assets/icons/admin';
import { Icon, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useThemeStore } from '@/stores';
import type { ThemeMode } from '@/types/theme';

const THEME_OPTIONS: {
  value: ThemeMode;
  label: string;
  icon: typeof AdminDarkIcon;
}[] = [
  { value: 'dark', label: '다크 모드', icon: AdminDarkIcon },
  { value: 'light', label: '라이트 모드', icon: AdminLightIcon },
  { value: 'auto', label: '시스템 기본', icon: AdminContrastIcon },
];

interface LNBThemeModeToggleProps {
  collapsed: boolean;
  className?: string;
}

function ThemeModeButton({
  value,
  label,
  icon,
  selected,
  onSelect,
}: {
  value: ThemeMode;
  label: string;
  icon: typeof AdminDarkIcon;
  selected: boolean;
  onSelect: (mode: ThemeMode) => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      onClick={() => onSelect(value)}
      className={cn(
        'flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors',
        selected
          ? 'border-button-neutral-interaction bg-container-neutral-interaction'
          : 'border-button-neutral bg-container-neutral hover:border-button-neutral-interaction hover:bg-container-neutral-interaction',
      )}
    >
      <Icon src={icon} size={20} className="text-icon-normal" />
    </button>
  );
}

function LNBThemeModeToggle({ collapsed, className }: LNBThemeModeToggleProps) {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  if (collapsed) {
    return (
      <div className={cn('flex flex-col items-center gap-200', className)}>
        {THEME_OPTIONS.map(({ value, label, icon }) => (
          <Tooltip key={value}>
            <TooltipTrigger asChild>
              <ThemeModeButton
                value={value}
                label={label}
                icon={icon}
                selected={mode === value}
                onSelect={setMode}
              />
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={6} align="center" variant="dark">
              {label}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-200', className)}>
      <span className="typo-caption1 text-text-alternative min-w-0 flex-1 whitespace-nowrap">
        화면 모드
      </span>
      <div className="flex gap-200">
        {THEME_OPTIONS.map(({ value, label, icon }) => (
          <ThemeModeButton
            key={value}
            value={value}
            label={label}
            icon={icon}
            selected={mode === value}
            onSelect={setMode}
          />
        ))}
      </div>
    </div>
  );
}

export { LNBThemeModeToggle, type LNBThemeModeToggleProps };
