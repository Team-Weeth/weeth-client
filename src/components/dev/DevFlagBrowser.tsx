'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { type DevFlagOverrides } from '@/flags/club-features/dev-overrides';
import { getAllFeatureFlags } from '@/lib/flagsmith';

interface DevFlagBrowserProps {
  clubId: string;
  overrides: DevFlagOverrides;
  canAdd: boolean;
  disabled: boolean;
  onAdd: (name: string, enabled: boolean) => void;
  onBack: () => void;
}

/** 이 동아리 기준 전체 플래그를 불러와 골라서 패널 목록에 넣는다. */
function DevFlagBrowser({
  clubId,
  overrides,
  canAdd,
  disabled,
  onAdd,
  onBack,
}: DevFlagBrowserProps) {
  const [search, setSearch] = useState('');
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['dev-flags', clubId],
    queryFn: () =>
      getAllFeatureFlags({ identifier: `club:${clubId}`, traits: { club_id: clubId } }),
    staleTime: 0,
    retry: false,
  });

  const keyword = search.trim().toLowerCase();
  const flags = Object.entries(data ?? {})
    .filter(([name]) => name.toLowerCase().includes(keyword))
    .sort(([a], [b]) => a.localeCompare(b));

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="typo-sub2 text-text-strong flex cursor-pointer items-center gap-100 self-start"
      >
        <ChevronLeftIcon className="size-4" aria-hidden />
        전체 플래그
      </button>

      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="이름으로 찾기"
        aria-label="플래그 이름으로 찾기"
        autoComplete="off"
        spellCheck={false}
        className="bg-button-neutral typo-body2"
      />

      {isPending && <p className="typo-caption1 text-text-alternative">불러오는 중...</p>}

      {isError && (
        <div className="flex items-center justify-between gap-200">
          <p className="typo-caption1 text-state-error">플래그 목록을 불러오지 못했어요.</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            다시 시도
          </Button>
        </div>
      )}

      {data && flags.length === 0 && (
        <p className="typo-caption1 text-text-alternative">
          {keyword ? '찾는 플래그가 없어요.' : '등록된 플래그가 없어요.'}
        </p>
      )}

      {flags.length > 0 && (
        <ul className="-mx-100 flex max-h-64 flex-col overflow-y-auto">
          {flags.map(([name, enabled]) => {
            const added = name in overrides;
            return (
              <li key={name} className="flex items-center gap-200 px-100 py-100">
                <span className="typo-body2 text-text-strong min-w-0 flex-1 break-all">{name}</span>
                <span className="typo-caption2 text-text-alternative">
                  {enabled ? 'ON' : 'OFF'}
                </span>
                <Button
                  variant={added ? 'tertiary' : 'secondary'}
                  size="sm"
                  disabled={added || !canAdd || disabled}
                  onClick={() => onAdd(name, enabled)}
                  aria-label={added ? `${name} 추가됨` : `${name} 추가`}
                  className="w-[64px] shrink-0"
                >
                  {added ? '추가됨' : '추가'}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export { DevFlagBrowser, type DevFlagBrowserProps };
