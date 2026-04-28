'use client';

import { useState } from 'react';
import { ChevronDown, Moon, Sun, SunMoon } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import { useThemeStore } from '@/stores/theme-store';

type ThemeMode = 'auto' | 'light' | 'dark';

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'auto', label: '자동', icon: SunMoon },
  { value: 'light', label: '라이트', icon: Sun },
  { value: 'dark', label: '다크', icon: Moon },
];

const TRIGGER_LABELS: Record<ThemeMode, string> = {
  auto: '자동 모드',
  light: '라이트 모드',
  dark: '다크 모드',
};

interface ThemeModeSelectorProps {
  collapsed?: boolean;
}

function ThemeModeSelector({ collapsed }: ThemeModeSelectorProps) {
  const setDark = useThemeStore((state) => state.setDark);

  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light';
    return useThemeStore.getState().isDark ? 'dark' : 'light';
  });

  const handleSelect = (value: ThemeMode) => {
    setMode(value);

    if (value === 'light') {
      setDark(false);
    } else if (value === 'dark') {
      setDark(true);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDark(prefersDark);
    }
  };

  const currentOption = THEME_OPTIONS.find((o) => o.value === mode)!;
  const TriggerIcon = currentOption.icon;

  const trigger = (
    <DropdownMenuTrigger asChild>
      <button
        className={cn(
          'text-text-normal flex h-12 w-full cursor-pointer items-center border-none transition-colors',
          'hover:bg-container-neutral-interaction',
          collapsed ? 'justify-center px-300' : 'gap-300 px-400',
        )}
      >
        <TriggerIcon className="text-icon-alternative h-6 w-6 shrink-0" />
        {!collapsed && (
          <>
            <span className="typo-button2 flex-1 text-left">{TRIGGER_LABELS[mode]}</span>
            <ChevronDown className="text-icon-alternative h-5 w-5 shrink-0" />
          </>
        )}
      </button>
    </DropdownMenuTrigger>
  );

  return (
    <DropdownMenu>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent side="right">{TRIGGER_LABELS[mode]}</TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}

      <DropdownMenuContent side="bottom" align="end" sideOffset={4} className="w-[200px]">
        {THEME_OPTIONS.map(({ value, label }) => (
          <DropdownMenuItem key={value} onSelect={() => handleSelect(value)}>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { ThemeModeSelector };
