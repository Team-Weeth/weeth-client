'use client';

import { useState } from 'react';
import { ChevronDown, Moon, Sun, SunMoon } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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

function ThemeModeSelector() {
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'typo-sub1 brand- text-text-alternative flex h-12 w-full cursor-pointer items-center gap-300 px-300 transition-colors',
            'hover:bg-container-neutral-interaction',
          )}
        >
          <TriggerIcon className="h-6 w-6 shrink-0" />
          <span className="flex-1 text-left">{TRIGGER_LABELS[mode]}</span>
          <ChevronDown className="h-5 w-5 shrink-0" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top" align="start" sideOffset={4} className="w-[200px]">
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
