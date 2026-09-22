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
  MemberPositionSavePayload,
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
  // 서버에 저장돼 있는 목록. 여기 없는 항목은 신규(id=null), 여기서 사라진 항목은 삭제 대상이다.
  const [serverOptions, setServerOptions] = useState(initialOptions);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idPrefix = useId();
  const nextId = useRef(0);
  const savingRef = useRef(false);
  const normalized = options.map((option) => ({ ...option, name: option.name.trim() }));
  const dirty = JSON.stringify(normalized) !== savedOptions;

  // 저장 직후 목록을 다시 받아오면 새 옵션에 서버 id가 붙는다. 편집 중이 아닐 때만 그 값을 받아들인다.
  if (initialOptions !== serverOptions && !dirty && !saving) {
    const next = initialOptions ?? createInitialOptions();
    setServerOptions(initialOptions);
    setOptions(next);
    setSavedOptions(JSON.stringify(next));
  }
  const duplicateNames =
    new Set(normalized.map((option) => option.name)).size !== normalized.length;
  // 길이도 실제로 보낼 값(다듬은 이름) 기준으로 센다. 앞뒤 공백까지 세면 서버가 받는 값과 어긋난다.
  const valid =
    options.length <= MAX_POSITION_OPTIONS &&
    normalized.every((option) => option.name) &&
    normalized.every((option) => Array.from(option.name).length <= MAX_POSITION_NAME_LENGTH) &&
    !duplicateNames;
  const canSave = valid && dirty && !saving;

  function updateOptions(next: MemberPositionOption[]) {
    setOptions(next);
    setError(null);
  }

  /** 서버 목록과 대조해 신규(id=null)·수정(id=서버 id)·삭제(deletedIds)를 나눈다. */
  function toSavePayload(current: MemberPositionOption[]): MemberPositionSavePayload {
    const savedIds = new Set((serverOptions ?? []).map((option) => option.id));
    const remainingIds = new Set(current.map((option) => option.id));

    return {
      options: current.map(({ id, name, color }) => ({
        id: savedIds.has(id) ? Number(id) : null,
        name,
        color,
      })),
      deletedIds: (serverOptions ?? [])
        .filter((option) => !remainingIds.has(option.id))
        .map((option) => Number(option.id)),
    };
  }

  async function handleSave() {
    if (!canSave || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError(null);
    try {
      await onSave(toSavePayload(normalized));
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
