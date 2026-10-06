import { renderHook, act } from '@testing-library/react';
import { useSubSelection } from '@/components/board/Editor/extensions/ImageGroup/useSubSelection';

function makeContainerRef(el: HTMLDivElement | null) {
  return { current: el };
}

describe('useSubSelection', () => {
  describe('초기 상태', () => {
    it('subSelectedIdx가 null로 초기화된다', () => {
      const { result } = renderHook(() => useSubSelection(true, makeContainerRef(null)));
      expect(result.current.subSelectedIdx).toBeNull();
    });
  });

  describe('handleDoubleClick', () => {
    it('편집 모드에서 더블클릭하면 해당 idx로 설정된다', () => {
      const { result } = renderHook(() => useSubSelection(true, makeContainerRef(null)));

      act(() => {
        result.current.handleDoubleClick({ stopPropagation: jest.fn() } as never, 2);
      });

      expect(result.current.subSelectedIdx).toBe(2);
    });

    it('읽기 전용 모드에서는 더블클릭해도 idx가 변경되지 않는다', () => {
      const { result } = renderHook(() => useSubSelection(false, makeContainerRef(null)));

      act(() => {
        result.current.handleDoubleClick({ stopPropagation: jest.fn() } as never, 1);
      });

      expect(result.current.subSelectedIdx).toBeNull();
    });

    it('handleDoubleClick이 stopPropagation을 호출한다', () => {
      const { result } = renderHook(() => useSubSelection(true, makeContainerRef(null)));
      const stopPropagation = jest.fn();

      act(() => {
        result.current.handleDoubleClick({ stopPropagation } as never, 0);
      });

      expect(stopPropagation).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleContainerClick', () => {
    it('[data-group-image]를 가진 요소를 클릭하면 subSelectedIdx가 유지된다', () => {
      const { result } = renderHook(() => useSubSelection(true, makeContainerRef(null)));

      act(() => {
        result.current.handleDoubleClick({ stopPropagation: jest.fn() } as never, 1);
      });
      expect(result.current.subSelectedIdx).toBe(1);

      const groupImageEl = document.createElement('div');
      groupImageEl.setAttribute('data-group-image', '');

      act(() => {
        result.current.handleContainerClick({ target: groupImageEl } as never);
      });

      expect(result.current.subSelectedIdx).toBe(1);
    });

    it('[data-group-image] 외부를 클릭하면 subSelectedIdx가 null이 된다', () => {
      const { result } = renderHook(() => useSubSelection(true, makeContainerRef(null)));

      act(() => {
        result.current.handleDoubleClick({ stopPropagation: jest.fn() } as never, 1);
      });

      const plainEl = document.createElement('div');

      act(() => {
        result.current.handleContainerClick({ target: plainEl } as never);
      });

      expect(result.current.subSelectedIdx).toBeNull();
    });
  });

  describe('컨테이너 바깥 mousedown 시 선택 해제', () => {
    it('subSelectedIdx가 설정된 상태에서 컨테이너 바깥을 mousedown하면 null로 초기화된다', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const { result } = renderHook(() => useSubSelection(true, makeContainerRef(container)));

      act(() => {
        result.current.handleDoubleClick({ stopPropagation: jest.fn() } as never, 0);
      });
      expect(result.current.subSelectedIdx).toBe(0);

      const outsideEl = document.createElement('div');
      document.body.appendChild(outsideEl);

      act(() => {
        outsideEl.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      });

      expect(result.current.subSelectedIdx).toBeNull();

      document.body.removeChild(container);
      document.body.removeChild(outsideEl);
    });

    it('컨테이너 내부를 mousedown하면 선택이 유지된다', () => {
      const container = document.createElement('div');
      const inner = document.createElement('button');
      container.appendChild(inner);
      document.body.appendChild(container);

      const { result } = renderHook(() => useSubSelection(true, makeContainerRef(container)));

      act(() => {
        result.current.handleDoubleClick({ stopPropagation: jest.fn() } as never, 0);
      });

      act(() => {
        inner.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      });

      expect(result.current.subSelectedIdx).toBe(0);

      document.body.removeChild(container);
    });
  });

  describe('setSubSelectedIdx', () => {
    it('setSubSelectedIdx로 직접 idx를 설정할 수 있다', () => {
      const { result } = renderHook(() => useSubSelection(true, makeContainerRef(null)));

      act(() => {
        result.current.setSubSelectedIdx(3);
      });

      expect(result.current.subSelectedIdx).toBe(3);
    });

    it('setSubSelectedIdx(null)로 선택을 해제할 수 있다', () => {
      const { result } = renderHook(() => useSubSelection(true, makeContainerRef(null)));

      act(() => {
        result.current.setSubSelectedIdx(1);
      });
      act(() => {
        result.current.setSubSelectedIdx(null);
      });

      expect(result.current.subSelectedIdx).toBeNull();
    });
  });
});
