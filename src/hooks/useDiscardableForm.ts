import { useEffect, useState } from 'react';

type DiscardSource = 'close' | 'cancel' | 'delete' | null;

interface UseDiscardableFormParams<T> {
  defaultValue: T;
  initialValues?: Partial<T>;
  open: boolean;
}

interface UseDiscardableFormResult<T> {
  form: T;
  setForm: React.Dispatch<React.SetStateAction<T>>;
  updateField: <K extends keyof T>(key: K, value: T[K]) => void;
  hasChanges: boolean;
  discardSource: DiscardSource;
  setDiscardSource: React.Dispatch<React.SetStateAction<DiscardSource>>;
  tryClose: (source: Exclude<DiscardSource, null>, onConfirmedClose: () => void) => void;
  confirmDiscard: (onClose: () => void) => void;
}

function useDiscardableForm<T extends object>({
  defaultValue,
  initialValues,
  open,
}: UseDiscardableFormParams<T>): UseDiscardableFormResult<T> {
  const [form, setForm] = useState<T>(() => ({ ...defaultValue, ...initialValues }));
  const [baseline, setBaseline] = useState<T>(form);
  const [discardSource, setDiscardSource] = useState<DiscardSource>(null);

  useEffect(() => {
    if (open) {
      const next = { ...defaultValue, ...initialValues };
      setForm(next);
      setBaseline(next);
      setDiscardSource(null);
    }
    // open이 true로 바뀔 때만 초기화 — 모달이 열려 있는 동안 initialValues 변경으로 유저 입력이 덮이지 않도록
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const updateField = <K extends keyof T>(key: K, value: T[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const hasChanges = (Object.keys(baseline) as (keyof T)[]).some(
    (key) => form[key] !== baseline[key],
  );

  const tryClose = (source: Exclude<DiscardSource, null>, onConfirmedClose: () => void) => {
    if (hasChanges) setDiscardSource(source);
    else onConfirmedClose();
  };

  const confirmDiscard = (onClose: () => void) => {
    setDiscardSource(null);
    onClose();
  };

  return {
    form,
    setForm,
    updateField,
    hasChanges,
    discardSource,
    setDiscardSource,
    tryClose,
    confirmDiscard,
  };
}

export { useDiscardableForm, type DiscardSource };
