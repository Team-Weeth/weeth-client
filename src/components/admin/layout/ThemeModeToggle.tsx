'use client';

import { AdminContrastIcon, AdminDarkIcon, AdminLightIcon } from '@/assets/icons/admin';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useThemeStore } from '@/stores';
import type { ThemeMode } from '@/types/theme';

const THEME_CYCLE: ThemeMode[] = ['dark', 'light', 'auto'];

const THEME_ICON: Record<ThemeMode, typeof AdminDarkIcon> = {
  dark: AdminDarkIcon,
  light: AdminLightIcon,
  auto: AdminContrastIcon,
};

const THEME_LABEL: Record<ThemeMode, string> = {
  dark: '다크 모드',
  light: '라이트 모드',
  auto: '시스템 기본',
};

interface ThemeModeToggleProps {
  className?: string;
}

function ThemeModeToggle({ className }: ThemeModeToggleProps) {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  const handleClick = () => {
    const nextIndex = (THEME_CYCLE.indexOf(mode) + 1) % THEME_CYCLE.length;
    setMode(THEME_CYCLE[nextIndex]);
  };

  return (
    <div className="group relative">
      <button
        type="button"
        aria-label={THEME_LABEL[mode]}
        onClick={handleClick}
        className={cn(
          'border-button-neutral bg-container-neutral hover:border-button-neutral-interaction hover:bg-container-neutral-interaction flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors',
          className,
        )}
      >
        <Icon src={THEME_ICON[mode]} size={20} className="text-icon-normal" />
      </button>
      <div
        className={cn(
          'pointer-events-none fixed top-14 right-4 z-50 rounded-sm whitespace-nowrap',
          'typo-sub1 bg-[#3E444A] px-[14px] py-[10px] text-[#FFF] [box-shadow:var(--shadow-md)]',
          'opacity-0 transition-opacity group-hover:opacity-100',
        )}
      >
        {THEME_LABEL[mode]}
      </div>
    </div>
  );
}

export { ThemeModeToggle, type ThemeModeToggleProps };
