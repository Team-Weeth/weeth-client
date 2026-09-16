'use client';

import { useId, useRef, useState } from 'react';

import AddRoundIcon from '@/assets/icons/add_round.svg';
import ArrowDownIcon from '@/assets/icons/arrow_down.svg';
import CheckIcon from '@/assets/icons/check.svg';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { cn } from '@/lib/cn';
import { getApiErrorMessage } from '@/utils/shared';

import { POSITION_COLORS, type MemberPositionColor } from '@/constants/admin/memberPosition';

interface MemberPositionOption {
  id: string;
  name: string;
  color: MemberPositionColor;
}

interface MemberPositionEditorProps {
  /** 최초 편집값. 다른 동아리로 전환할 때는 부모에서 key를 변경한다. */
  initialOptions?: MemberPositionOption[];
  onSave: (options: MemberPositionOption[]) => void | Promise<void>;
  className?: string;
}

const MAX_OPTIONS = 6;
const MAX_NAME_LENGTH = 10;
const getNameLength = (name: string) => Array.from(name).length;
const createInitialOptions = (): MemberPositionOption[] =>
  POSITION_COLORS.slice(0, 4).map(({ value }, index) => ({
    id: `initial-${index}`,
    name: '',
    color: value,
  }));

function PositionColorPicker({
  value,
  onChange,
  label,
  disabled,
  usedColors,
}: {
  value: MemberPositionColor;
  onChange: (value: MemberPositionColor) => void;
  label: string;
  disabled: boolean;
  usedColors: MemberPositionColor[];
}) {
  const selected = POSITION_COLORS.find((color) => color.value === value)!;
  return (
    <DropdownMenu type="position">
      <DropdownMenuTrigger disabled={disabled} aria-label={`${label}: ${selected.label}`}>
        <span className={cn('size-5 shrink-0 rounded-full', selected.className)} />
        <Icon src={ArrowDownIcon} size={20} />
      </DropdownMenuTrigger>
      <DropdownMenuContent aria-label={label} align="start">
        {POSITION_COLORS.map((color) => {
          const isSelected = color.value === value;
          const unavailable = !isSelected && usedColors.includes(color.value);
          return (
            <DropdownMenuItem
              key={color.value}
              aria-label={color.label}
              aria-current={isSelected ? 'true' : undefined}
              disabled={unavailable}
              className="data-[disabled]:cursor-not-allowed"
              onSelect={() => onChange(color.value)}
            >
              <span
                aria-hidden
                className={cn(
                  'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full',
                  color.className,
                  isSelected ? 'size-7 p-[2px]' : 'size-6',
                  unavailable && 'opacity-50',
                )}
              >
                {isSelected && (
                  <span className="flex size-full items-center justify-center rounded-full border-2 border-white">
                    <Icon src={CheckIcon} size={16} className="text-white" />
                  </span>
                )}
                {unavailable && <span className="absolute h-[2px] w-[140%] rotate-45 bg-white" />}
              </span>
              <span className="sr-only">
                {isSelected ? '선택됨' : unavailable ? '다른 옵션에서 사용 중' : color.label}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PositionNameInput({
  value,
  onChange,
  label,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled: boolean;
}) {
  const counterId = useId();
  const [focused, setFocused] = useState(false);
  const length = getNameLength(value);
  const exceeded = length > MAX_NAME_LENGTH;
  const showCounter = focused && length > 0;

  return (
    <div className="relative min-w-0 flex-1">
      <Input
        aria-label={label}
        aria-describedby={showCounter ? counterId : undefined}
        value={value}
        disabled={disabled}
        error={exceeded}
        placeholder="옵션을 입력해 주세요"
        className={cn(
          'typo-body1 bg-container-neutral-interaction focus:bg-container-neutral h-12 px-400',
          showCounter && 'pr-20',
          exceeded && 'bg-container-neutral',
        )}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {showCounter && (
        <span
          id={counterId}
          className={cn(
            'typo-body1 pointer-events-none absolute top-1/2 right-400 -translate-y-1/2 tracking-[-0.07px] [--body1-weight:470]',
            exceeded ? 'text-state-error' : 'text-text-alternative',
          )}
        >
          {length}/{MAX_NAME_LENGTH}
        </span>
      )}
    </div>
  );
}

function MemberPositionEditor({ initialOptions, onSave, className }: MemberPositionEditorProps) {
  const [options, setOptions] = useState<MemberPositionOption[]>(
    () => initialOptions ?? createInitialOptions(),
  );
  const [savedOptions, setSavedOptions] = useState(() =>
    JSON.stringify(initialOptions ?? createInitialOptions()),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idPrefix = useId();
  const nextId = useRef(0);
  const savingRef = useRef(false);
  const headingId = useId();
  const normalized = options.map((option) => ({ ...option, name: option.name.trim() }));
  const duplicateNames =
    new Set(normalized.map((option) => option.name)).size !== normalized.length;
  const valid =
    options.length <= MAX_OPTIONS &&
    normalized.every((option) => option.name) &&
    options.every((option) => getNameLength(option.name) <= MAX_NAME_LENGTH) &&
    !duplicateNames;
  const canSave = valid && JSON.stringify(normalized) !== savedOptions && !saving;

  function updateOptions(next: MemberPositionOption[]) {
    setOptions(next);
    setError(null);
  }

  async function handleSave() {
    if (!canSave || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError(null);
    try {
      await onSave(normalized);
      setOptions(normalized);
      setSavedOptions(JSON.stringify(normalized));
    } catch (error) {
      setError(getApiErrorMessage(error) || '포지션 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <form
      className={cn('flex min-w-0 flex-col gap-400', className)}
      onSubmit={(event) => {
        event.preventDefault();
        void handleSave();
      }}
    >
      <section
        aria-labelledby={headingId}
        className="bg-background flex flex-col gap-400 rounded-lg p-600"
      >
        <div className="mb-200 flex flex-col gap-100">
          <h2 id={headingId} className="typo-h3 text-text-strong">
            포지션
          </h2>
          <p className="typo-body1 text-text-alternative">
            해당 필드에 옵션을 설정해 두면 멤버 관리 표에서 볼 수 있습니다.
          </p>
        </div>
        <div className="border-line overflow-hidden rounded-sm border">
          <div className="bg-container-neutral-interaction typo-sub3 text-text-alternative px-400 py-400">
            선택 옵션
          </div>
          <div className="divide-line divide-y">
            {options.length === 0 && (
              <p className="bg-container-neutral typo-sub1 text-text-disabled flex items-center justify-center gap-4 px-500 py-700 text-center">
                옵션을 추가해 보세요.
              </p>
            )}
            {options.map((option, index) => (
              <div
                key={option.id}
                className="bg-container-neutral flex items-center gap-4 px-500 py-400"
              >
                <PositionColorPicker
                  value={option.color}
                  usedColors={options
                    .filter((item) => item.id !== option.id && item.name.trim().length > 0)
                    .map((item) => item.color)}
                  label={`옵션 ${index + 1} 색상`}
                  disabled={saving}
                  onChange={(color) =>
                    updateOptions(
                      options.map((item) => (item.id === option.id ? { ...item, color } : item)),
                    )
                  }
                />
                <PositionNameInput
                  label={`옵션 ${index + 1} 이름`}
                  value={option.name}
                  disabled={saving}
                  onChange={(name) =>
                    updateOptions(
                      options.map((item) => (item.id === option.id ? { ...item, name } : item)),
                    )
                  }
                />
                <Button
                  variant="secondary"
                  size="lg"
                  className="shrink-0"
                  disabled={saving}
                  aria-label={`옵션 ${index + 1} 삭제`}
                  onClick={() => updateOptions(options.filter((item) => item.id !== option.id))}
                >
                  삭제
                </Button>
              </div>
            ))}
          </div>
        </div>
        <Button
          variant="secondary"
          size="md"
          className="w-full gap-100"
          disabled={options.length >= MAX_OPTIONS || saving}
          onClick={() =>
            updateOptions([
              ...options,
              {
                id: `${idPrefix}-${nextId.current++}`,
                name: '',
                color:
                  POSITION_COLORS.find(
                    (color) => !options.some((option) => option.color === color.value),
                  )?.value ?? 'primary',
              },
            ])
          }
        >
          <span className="flex size-5 shrink-0 items-center justify-center" aria-hidden>
            <Icon src={AddRoundIcon} size={14} />
          </span>
          옵션 추가하기 ({options.length}/{MAX_OPTIONS})
        </Button>
        {duplicateNames && normalized.every((option) => option.name) && (
          <p role="alert" className="typo-caption1 text-state-error">
            옵션 이름은 서로 다르게 입력해주세요.
          </p>
        )}
      </section>
      {error && (
        <p role="alert" className="typo-body2 text-state-error">
          {error}
        </p>
      )}
      <Button type="submit" variant="primary" size="lg" className="self-end" disabled={!canSave}>
        {saving ? '저장 중...' : '저장하기'}
      </Button>
    </form>
  );
}

export {
  MemberPositionEditor,
  type MemberPositionEditorProps,
  type MemberPositionOption,
  type MemberPositionColor,
};
