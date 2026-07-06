import { renderHook, act } from '@testing-library/react';

import { useDragScroll } from '@/hooks/useDragScroll';

function makeScrollableEl(): HTMLDivElement {
  const el = document.createElement('div');
  el.scrollBy = jest.fn();
  el.scrollTo = jest.fn();
  Object.defineProperty(el, 'offsetLeft', { value: 0, configurable: true });
  return el;
}

function attachEl(ref: React.RefObject<HTMLDivElement | null>, el: HTMLDivElement) {
  (ref as React.MutableRefObject<HTMLDivElement>).current = el;
}

describe('useDragScroll', () => {
  it('ref, onMouseDown, onKeyDown, scrollToEnd를 반환한다', () => {
    const { result } = renderHook(() => useDragScroll());
    expect(result.current.ref).toBeDefined();
    expect(typeof result.current.onMouseDown).toBe('function');
    expect(typeof result.current.onKeyDown).toBe('function');
    expect(typeof result.current.scrollToEnd).toBe('function');
  });

  describe('onKeyDown', () => {
    it('ArrowRight → scrollBy({ left: 200, behavior: "smooth" }) 호출', () => {
      const { result } = renderHook(() => useDragScroll());
      const el = makeScrollableEl();
      attachEl(result.current.ref, el);

      act(() => {
        result.current.onKeyDown({
          key: 'ArrowRight',
          preventDefault: jest.fn(),
        } as unknown as React.KeyboardEvent);
      });

      expect(el.scrollBy).toHaveBeenCalledWith({ left: 200, behavior: 'smooth' });
    });

    it('ArrowLeft → scrollBy({ left: -200, behavior: "smooth" }) 호출', () => {
      const { result } = renderHook(() => useDragScroll());
      const el = makeScrollableEl();
      attachEl(result.current.ref, el);

      act(() => {
        result.current.onKeyDown({
          key: 'ArrowLeft',
          preventDefault: jest.fn(),
        } as unknown as React.KeyboardEvent);
      });

      expect(el.scrollBy).toHaveBeenCalledWith({ left: -200, behavior: 'smooth' });
    });

    it('다른 키 → scrollBy 호출 안 됨', () => {
      const { result } = renderHook(() => useDragScroll());
      const el = makeScrollableEl();
      attachEl(result.current.ref, el);

      act(() => {
        result.current.onKeyDown({
          key: 'Enter',
          preventDefault: jest.fn(),
        } as unknown as React.KeyboardEvent);
      });

      expect(el.scrollBy).not.toHaveBeenCalled();
    });

    it('ref.current가 null이면 에러가 발생하지 않는다', () => {
      const { result } = renderHook(() => useDragScroll());

      expect(() => {
        act(() => {
          result.current.onKeyDown({
            key: 'ArrowRight',
            preventDefault: jest.fn(),
          } as unknown as React.KeyboardEvent);
        });
      }).not.toThrow();
    });
  });

  describe('onMouseDown', () => {
    it('ref.current가 있으면 window에 mousemove·mouseup 이벤트 리스너가 등록된다', () => {
      const { result } = renderHook(() => useDragScroll());
      const el = makeScrollableEl();
      attachEl(result.current.ref, el);
      const addSpy = jest.spyOn(window, 'addEventListener');

      result.current.onMouseDown({
        pageX: 100,
        preventDefault: jest.fn(),
      } as unknown as React.MouseEvent);

      expect(addSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(addSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
      addSpy.mockRestore();
    });

    it('mouseup 이벤트 후 mousemove 리스너가 제거된다', () => {
      const { result } = renderHook(() => useDragScroll());
      const el = makeScrollableEl();
      attachEl(result.current.ref, el);
      const removeSpy = jest.spyOn(window, 'removeEventListener');

      result.current.onMouseDown({
        pageX: 0,
        preventDefault: jest.fn(),
      } as unknown as React.MouseEvent);

      window.dispatchEvent(new MouseEvent('mouseup'));

      expect(removeSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(removeSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
      removeSpy.mockRestore();
    });

    it('ref.current가 null이면 에러가 발생하지 않는다', () => {
      const { result } = renderHook(() => useDragScroll());

      expect(() => {
        result.current.onMouseDown({
          pageX: 0,
          preventDefault: jest.fn(),
        } as unknown as React.MouseEvent);
      }).not.toThrow();
    });
  });
});
