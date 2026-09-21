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
    if (
      patch.color &&
      options.some(
        (option) => option.id !== id && option.name.trim() && option.color === patch.color,
      )
    ) {
      return;
    }

    const next = options.map((option) => (option.id === id ? { ...option, ...patch } : option));
    if (patch.color) {
      const usedColors = new Set(next.map((option) => option.color));
      for (const option of next) {
        if (option.id === id || option.name.trim() || option.color !== patch.color) continue;
        const availableColor = POSITION_COLORS.find((color) => !usedColors.has(color.value));
        if (availableColor) {
          // 빈 옵션만 재배정하며 기존 state의 객체는 변경하지 않는다.
          const index = next.indexOf(option);
          next[index] = { ...option, color: availableColor.value };
          usedColors.add(availableColor.value);
        }
      }
    }
    updateOptions(next);
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
    return options
      .filter((option) => option.id !== id && option.name.trim().length > 0)
      .map((option) => option.color);
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
