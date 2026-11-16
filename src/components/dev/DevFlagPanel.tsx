'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRightIcon, FlagIcon, XIcon } from 'lucide-react';
import { DevFlagBrowser } from '@/components/dev/DevFlagBrowser';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/Switch';
import {
  DEV_FLAG_KEY_PATTERN,
  DEV_FLAG_OVERRIDE_COOKIE,
  MAX_DEV_FLAG_OVERRIDES,
  serializeDevFlagOverrides,
  type DevFlagOverrides,
} from '@/flags/club-features/dev-overrides';
import { cn } from '@/lib/cn';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function writeOverrideCookie(overrides: DevFlagOverrides) {
  const value = Object.keys(overrides).length > 0 ? serializeDevFlagOverrides(overrides) : '';
  const maxAge = value ? COOKIE_MAX_AGE : 0;
  document.cookie = `${DEV_FLAG_OVERRIDE_COOKIE}=${value}; path=/; max-age=${maxAge}; samesite=lax`;
}

function validateKey(key: string, overrides: DevFlagOverrides) {
  if (!DEV_FLAG_KEY_PATTERN.test(key)) return '영문, 숫자, _ . - 만 쓸 수 있어요.';
  if (key in overrides) return '이미 추가한 플래그예요.';
  if (Object.keys(overrides).length >= MAX_DEV_FLAG_OVERRIDES) {
    return `최대 ${MAX_DEV_FLAG_OVERRIDES}개까지 추가할 수 있어요.`;
  }
  return null;
}

interface DevFlagPanelProps {
  clubId: string;
  overrides: DevFlagOverrides;
  className?: string;
}

/**
 * 로컬·dev 배포에서 플래그를 골라 넣고 켜고 끄는 개발용 패널. 운영에서는 렌더링하지 않는다.
 * 전체 플래그 목록에서 고르거나 이름을 직접 입력해 넣는다.
 * 목록은 쿠키에 저장한다. 플래그 값은 서버 렌더링 때 정해지므로 서버가 읽을 수 있는 쿠키여야 한다.
 */
function DevFlagPanel({ clubId, overrides, className }: DevFlagPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newKey, setNewKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isBrowsing, setIsBrowsing] = useState(false);
  const entries = Object.entries(overrides);

  const applyOverrides = (next: DevFlagOverrides) => {
    writeOverrideCookie(next);
    startTransition(() => router.refresh());
  };

  const addFlag = () => {
    const key = newKey.trim();
    const message = validateKey(key, overrides);
    setError(message);
    if (message) return;

    setNewKey('');
    applyOverrides({ ...overrides, [key]: true });
  };

  const removeFlag = (key: string) => {
    const next = { ...overrides };
    delete next[key];
    applyOverrides(next);
  };

  return (
    <Popover onOpenChange={(open) => !open && setIsBrowsing(false)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-dev-overlay
          aria-label={`개발용 플래그 패널${entries.length > 0 ? ` (플래그 ${entries.length}개)` : ''}`}
          className={cn(
            // 왼쪽 아래의 Next dev 표시(지름 36px, 하단 20px)와 같은 모양으로 그 위에 둔다.
            'bg-container-floating border-floating-border text-text-inverse fixed bottom-[68px] left-500 z-80 flex size-9 cursor-pointer items-center justify-center rounded-full border shadow-md',
            className,
          )}
        >
          <FlagIcon className="size-4" aria-hidden />
          {entries.length > 0 && (
            <span className="bg-brand-primary typo-caption2 text-text-inverse absolute -top-100 -right-100 flex size-4 items-center justify-center rounded-full">
              {entries.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        data-dev-overlay
        className="max-h-[var(--radix-popover-content-available-height)] w-80 gap-300 overflow-y-auto p-400"
      >
        {isBrowsing ? (
          <DevFlagBrowser
            clubId={clubId}
            overrides={overrides}
            canAdd={entries.length < MAX_DEV_FLAG_OVERRIDES}
            disabled={isPending}
            onAdd={(name, enabled) => applyOverrides({ ...overrides, [name]: enabled })}
            onBack={() => setIsBrowsing(false)}
          />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="typo-sub2 text-text-strong">플래그</p>
              <button
                type="button"
                onClick={() => applyOverrides({})}
                disabled={entries.length === 0 || isPending}
                className="typo-caption1 text-text-alternative disabled:text-text-disabled cursor-pointer disabled:cursor-not-allowed"
              >
                전체 삭제
              </button>
            </div>

            {entries.length === 0 ? (
              <p className="typo-caption1 text-text-alternative break-keep">
                추가한 플래그가 없어요. 넣지 않은 플래그는 원래 값을 그대로 써요.
              </p>
            ) : (
              <ul className="flex flex-col gap-200">
                {entries.map(([key, enabled]) => (
                  <li key={key} className="flex items-center gap-200">
                    <span className="typo-body2 text-text-strong min-w-0 flex-1 break-all">
                      {key}
                    </span>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) =>
                        applyOverrides({ ...overrides, [key]: checked })
                      }
                      disabled={isPending}
                      aria-label={key}
                    />
                    <button
                      type="button"
                      onClick={() => removeFlag(key)}
                      disabled={isPending}
                      aria-label={`${key} 삭제`}
                      className="text-text-alternative hover:text-text-normal cursor-pointer p-100 disabled:cursor-wait"
                    >
                      <XIcon className="size-4" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-col gap-100">
              <div className="flex gap-200">
                <Input
                  value={newKey}
                  onChange={(event) => {
                    setNewKey(event.target.value);
                    setError(null);
                  }}
                  placeholder="플래그 이름"
                  aria-label="추가할 플래그 이름"
                  aria-invalid={error ? true : undefined}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.nativeEvent.isComposing) addFlag();
                  }}
                  autoComplete="off"
                  spellCheck={false}
                  className="bg-button-neutral typo-body2 min-w-0 flex-1"
                />
                <Button size="sm" onClick={addFlag} disabled={!newKey.trim() || isPending}>
                  추가
                </Button>
              </div>
              {error && (
                <p role="alert" className="typo-caption2 text-state-error">
                  {error}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsBrowsing(true)}
              className="typo-caption1 text-text-alternative hover:text-text-normal flex cursor-pointer items-center justify-center gap-100"
            >
              전체 플래그에서 고르기
              <ChevronRightIcon className="size-4" aria-hidden />
            </button>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

export { DevFlagPanel, type DevFlagPanelProps };
