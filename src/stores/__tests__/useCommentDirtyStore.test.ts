import { act, renderHook } from '@testing-library/react';
import {
  useCommentDirtyStore,
  useCommentDirty,
  useSetCommentDirty,
  useCommentDirtyReset,
} from '@/stores/useCommentDirtyStore';

beforeEach(() => {
  useCommentDirtyStore.setState({ dirty: false });
});

describe('초기 상태', () => {
  it('dirty가 false다', () => {
    expect(useCommentDirtyStore.getState().dirty).toBe(false);
  });
});

describe('setDirty', () => {
  it('setDirty(true)로 dirty를 true로 변경한다', () => {
    act(() => {
      useCommentDirtyStore.getState().setDirty(true);
    });
    expect(useCommentDirtyStore.getState().dirty).toBe(true);
  });

  it('setDirty(false)로 dirty를 다시 false로 변경한다', () => {
    act(() => {
      useCommentDirtyStore.getState().setDirty(true);
    });
    act(() => {
      useCommentDirtyStore.getState().setDirty(false);
    });
    expect(useCommentDirtyStore.getState().dirty).toBe(false);
  });
});

describe('reset', () => {
  it('dirty를 초기 상태(false)로 복원한다', () => {
    act(() => {
      useCommentDirtyStore.getState().setDirty(true);
    });
    act(() => {
      useCommentDirtyStore.getState().reset();
    });
    expect(useCommentDirtyStore.getState().dirty).toBe(false);
  });
});

describe('셀렉터 훅', () => {
  it('useCommentDirty: dirty 값을 반환한다', () => {
    act(() => {
      useCommentDirtyStore.getState().setDirty(true);
    });
    const { result } = renderHook(() => useCommentDirty());
    expect(result.current).toBe(true);
  });

  it('useSetCommentDirty: setDirty 함수를 반환하고 스토어를 업데이트한다', () => {
    const { result } = renderHook(() => useSetCommentDirty());
    act(() => {
      result.current(true);
    });
    expect(useCommentDirtyStore.getState().dirty).toBe(true);
  });

  it('useCommentDirtyReset: reset 함수를 반환하고 스토어를 초기화한다', () => {
    act(() => {
      useCommentDirtyStore.getState().setDirty(true);
    });
    const { result } = renderHook(() => useCommentDirtyReset());
    act(() => {
      result.current();
    });
    expect(useCommentDirtyStore.getState().dirty).toBe(false);
  });
});
