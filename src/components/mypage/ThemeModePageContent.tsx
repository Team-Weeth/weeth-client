'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BackIcon from '@/assets/icons/back.svg';
import { useThemeStore } from '@/stores/theme-store';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import type { ThemeMode } from '@/types/theme';
import { ThemeModeSelector } from './ThemeModeSelector';

type ThemeModePageContentProps = React.HTMLAttributes<HTMLDivElement>;

function ThemeModePageContent({ className, ...props }: ThemeModePageContentProps) {
  const router = useRouter();
  const mode = useThemeStore((state) => state.mode);
  const hasHydrated = useThemeStore((state) => state.hasHydrated);
  const setMode = useThemeStore((state) => state.setMode);
  const [selectedMode, setSelectedMode] = useState<ThemeMode>(mode);

  useEffect(() => {
    setSelectedMode(mode);
  }, [mode]);

  const handleConfirm = () => {
    setMode(selectedMode);
    router.back();
  };

  return (
    <div
      className={cn('tablet:hidden flex min-w-0 flex-1 flex-col gap-4 pb-[140px]', className)}
      {...props}
    >
      <div className="flex items-center gap-1 py-300">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center p-1"
        >
          <Icon src={BackIcon} size={21} className="text-icon-normal p-1" />
        </button>
        <h1 className="typo-sub1 text-text-normal">화면 모드</h1>
      </div>

      <ThemeModeSelector
        selectedMode={selectedMode}
        onSelectMode={setSelectedMode}
        disabled={!hasHydrated}
        layout="mobile-page"
        className="flex-1"
      />

      <div className="fixed inset-x-0 bottom-12 z-20 px-450">
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={!hasHydrated}
          onClick={handleConfirm}
        >
          완료
        </Button>
      </div>
    </div>
  );
}

export { ThemeModePageContent, type ThemeModePageContentProps };
