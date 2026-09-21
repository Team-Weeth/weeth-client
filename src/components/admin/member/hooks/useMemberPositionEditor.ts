'use client';

import { useId, useRef, useState } from 'react';
import {
  POSITION_COLORS,
  MAX_POSITION_OPTIONS,
  MAX_POSITION_NAME_LENGTH,
} from '@/constants/admin/memberPosition';
import type {
  MemberPositionEditorOptions,
  MemberPositionOption,
} from '@/types/admin/memberPosition';
import { getApiErrorMessage } from '@/utils/shared';

const createInitialOptions = (): MemberPositionOption[] =>
  POSITION_COLORS.slice(0, 4).map(({ value }, index) => ({
    id: `initial-${index}`,
    name: '',
    color: value,
  }));

function useMemberPositionEditor({ initialOptions, onSave }: MemberPositionEditorOptions) {
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
  const normalized = options.map((option) => ({ ...option, name: option.name.trim() }));
  const duplicateNames =
    new Set(normalized.map((option) => option.name)).size !== normalized.length;
  const valid =
    options.length <= MAX_POSITION_OPTIONS &&
    normalized.every((option) => option.name) &&
    options.every((option) => Array.from(option.name).length <= MAX_POSITION_NAME_LENGTH) &&
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

  function updateOption(id: string, patch: Partial<Pick<MemberPositionOption, 'name' | 'color'>>) {
    // 이름을 입력했는지와 무관하게 다른 옵션이 쥐고 있는 색은 가져올 수 없다.
    if (patch.color && options.some((option) => option.id !== id && option.color === patch.color)) {
      return;
    }

    updateOptions(options.map((option) => (option.id === id ? { ...option, ...patch } : option)));
  }

  function removeOption(id: string) {
    updateOptions(options.filter((option) => option.id !== id));
  }

  function addOption() {
    if (options.length >= MAX_POSITION_OPTIONS || saving) return;
    updateOptions([
      ...options,
      {
        id: `${idPrefix}-${nextId.current++}`,
        name: '',
        color:
          POSITION_COLORS.find((color) => !options.some((option) => option.color === color.value))
            ?.value ?? 'primary',
      },
    ]);
  }

  function getUsedColors(id: string) {
    return options.filter((option) => option.id !== id).map((option) => option.color);
  }

  return {
    options,
    saving,
    error,
    canSave,
    canAdd: options.length < MAX_POSITION_OPTIONS && !saving,
    hasDuplicateNames: duplicateNames && normalized.every((option) => Boolean(option.name)),
    updateOption,
    removeOption,
    addOption,
    getUsedColors,
    handleSave,
  };
}

export { useMemberPositionEditor };
