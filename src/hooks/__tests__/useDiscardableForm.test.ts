import { renderHook, act } from '@testing-library/react';

import { useDiscardableForm } from '@/hooks/useDiscardableForm';

interface TestForm {
  name: string;
  age: number;
}

const defaultValue: TestForm = { name: '', age: 0 };

describe('useDiscardableForm', () => {
  it('defaultValue로 초기화된다', () => {
    const { result } = renderHook(() => useDiscardableForm({ defaultValue, open: false }));

    expect(result.current.form).toEqual(defaultValue);
    expect(result.current.hasChanges).toBe(false);
    expect(result.current.discardSource).toBeNull();
  });

  it('initialValues가 있으면 defaultValue와 병합하여 초기화된다', () => {
    const { result } = renderHook(() =>
      useDiscardableForm({ defaultValue, initialValues: { name: '홍길동' }, open: false }),
    );

    expect(result.current.form).toEqual({ name: '홍길동', age: 0 });
  });

  it('updateField로 특정 필드를 변경한다', () => {
    const { result } = renderHook(() => useDiscardableForm({ defaultValue, open: false }));

    act(() => {
      result.current.updateField('name', '홍길동');
    });

    expect(result.current.form.name).toBe('홍길동');
  });

  it('baseline과 다른 값이면 hasChanges가 true이다', () => {
    const { result } = renderHook(() => useDiscardableForm({ defaultValue, open: false }));

    act(() => {
      result.current.updateField('name', '홍길동');
    });

    expect(result.current.hasChanges).toBe(true);
  });

  it('변경 후 baseline과 같은 값으로 되돌리면 hasChanges가 false이다', () => {
    const { result } = renderHook(() => useDiscardableForm({ defaultValue, open: false }));

    act(() => {
      result.current.updateField('name', '홍길동');
    });
    act(() => {
      result.current.updateField('name', '');
    });

    expect(result.current.hasChanges).toBe(false);
  });

  it('tryClose — 변경 없으면 onConfirmedClose를 즉시 호출한다', () => {
    const { result } = renderHook(() => useDiscardableForm({ defaultValue, open: false }));
    const onConfirmedClose = jest.fn();

    act(() => {
      result.current.tryClose('close', onConfirmedClose);
    });

    expect(onConfirmedClose).toHaveBeenCalledTimes(1);
    expect(result.current.discardSource).toBeNull();
  });

  it('tryClose — 변경 있으면 discardSource를 설정하고 onConfirmedClose를 호출하지 않는다', () => {
    const { result } = renderHook(() => useDiscardableForm({ defaultValue, open: false }));
    const onConfirmedClose = jest.fn();

    act(() => {
      result.current.updateField('name', '홍길동');
    });
    act(() => {
      result.current.tryClose('cancel', onConfirmedClose);
    });

    expect(result.current.discardSource).toBe('cancel');
    expect(onConfirmedClose).not.toHaveBeenCalled();
  });

  it('tryClose — source가 "close"이면 discardSource가 "close"이다', () => {
    const { result } = renderHook(() => useDiscardableForm({ defaultValue, open: false }));

    act(() => {
      result.current.updateField('age', 99);
    });
    act(() => {
      result.current.tryClose('close', jest.fn());
    });

    expect(result.current.discardSource).toBe('close');
  });

  it('confirmDiscard — discardSource를 초기화하고 onClose를 호출한다', () => {
    const { result } = renderHook(() => useDiscardableForm({ defaultValue, open: false }));
    const onClose = jest.fn();

    act(() => {
      result.current.updateField('name', '홍길동');
    });
    act(() => {
      result.current.tryClose('close', jest.fn());
    });
    act(() => {
      result.current.confirmDiscard(onClose);
    });

    expect(result.current.discardSource).toBeNull();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('open이 true로 바뀌면 form과 discardSource를 초기화한다', () => {
    const { result, rerender } = renderHook(
      ({ open }: { open: boolean }) => useDiscardableForm({ defaultValue, open }),
      { initialProps: { open: false } },
    );

    act(() => {
      result.current.updateField('name', '홍길동');
    });
    expect(result.current.hasChanges).toBe(true);

    rerender({ open: true });

    expect(result.current.form).toEqual(defaultValue);
    expect(result.current.hasChanges).toBe(false);
    expect(result.current.discardSource).toBeNull();
  });
});
