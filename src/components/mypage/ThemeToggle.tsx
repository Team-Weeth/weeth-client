'use client';

import { useState } from 'react';

import { cn } from '@/lib/cn';
import { useThemeStore } from '@/stores/theme-store';

type ThemeMode = 'auto' | 'light' | 'dark';

const OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'auto', label: '자동' },
  { value: 'light', label: '라이트' },
  { value: 'dark', label: '다크' },
];

type ThemeToggleProps = React.HTMLAttributes<HTMLDivElement>;

function ThemeToggle({ className, ...props }: ThemeToggleProps) {
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

  return (
    <div
      className={cn(
        'bg-container-neutral-interaction flex w-full overflow-hidden rounded-md p-[2px]',
        className,
      )}
      {...props}
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => handleSelect(option.value)}
          className={cn(
            'typo-caption1 relative h-[28px] flex-1 cursor-pointer rounded-[10px] transition-colors focus-visible:outline-none',
            mode === option.value
              ? 'bg-button-primary text-text-inverse shadow-sm'
              : 'text-text-alternative hover:text-text-normal',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export { ThemeToggle, type ThemeToggleProps };
