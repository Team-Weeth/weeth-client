'use client';

import { CheckRoundIcon } from '@/assets/icons';
import { AdminBackIcon, AdminRadioUnselectedIcon } from '@/assets/icons/admin';
import { Icon } from '@/components/ui';
import type { ThemeMode } from '@/types/theme';

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'auto', label: '자동 모드' },
  { value: 'light', label: '라이트 모드' },
  { value: 'dark', label: '다크 모드' },
];

interface AppearanceViewProps {
  mode: ThemeMode;
  onModeChange: (mode: ThemeMode) => void;
  onBack: () => void;
}

function AppearanceView({ mode, onModeChange, onBack }: AppearanceViewProps) {
  return (
    <>
      <div className="flex items-center gap-100 px-200 py-300">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로 가기"
          className="hover:bg-container-neutral-interaction flex cursor-pointer items-center justify-center rounded-sm p-100 transition-colors"
        >
          <Icon src={AdminBackIcon} size={24} className="text-icon-normal" aria-hidden />
        </button>
        <span className="typo-sub1 text-text-normal">화면 모드</span>
      </div>

      <div role="radiogroup" aria-label="화면 모드" className="flex flex-col gap-[10px] px-450">
        {THEME_OPTIONS.map(({ value, label }, index) => (
          <div key={value}>
            <button
              type="button"
              role="radio"
              aria-checked={mode === value}
              onClick={() => onModeChange(value)}
              className="flex w-full items-center justify-between py-300"
            >
              <span className="typo-sub1 text-text-normal">{label}</span>
              {mode === value ? (
                <Icon src={CheckRoundIcon} size={20} className="text-brand-primary" aria-hidden />
              ) : (
                <Icon
                  src={AdminRadioUnselectedIcon}
                  size={20}
                  className="text-icon-alternative"
                  aria-hidden
                />
              )}
            </button>
            {index < THEME_OPTIONS.length - 1 && <div className="bg-line h-px" />}
          </div>
        ))}
      </div>
    </>
  );
}

export { AppearanceView };
