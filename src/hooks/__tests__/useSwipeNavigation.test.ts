import { render, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import React from 'react';

import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';

// ── helpers ───────────────────────────────────────────────────────────────────

type HookHandlers = ReturnType<typeof useSwipeNavigation>;

function renderWithCapture(onPrev: jest.Mock, onNext: jest.Mock) {
  let touchMoveListener: ((e: Partial<TouchEvent>) => void) | null = null;
  let handlers: HookHandlers | null = null;

  function TestHarness({ onPrev, onNext }: { onPrev: jest.Mock; onNext: jest.Mock }) {
    const result = useSwipeNavigation({ onPrev, onNext });
    React.useEffect(() => {
      handlers = result;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return React.createElement('div', { ref: result.containerRef, 'data-testid': 'container' });
  }

  const origAEL = EventTarget.prototype.addEventListener;
  const spy = jest.spyOn(EventTarget.prototype, 'addEventListener').mockImplementation(function (
    this: EventTarget,
    type: string,
    handler: EventListenerOrEventListenerObject | null,
    opts?: AddEventListenerOptions | boolean,
  ) {
    if (type === 'touchmove' && typeof handler === 'function') {
      touchMoveListener = handler as (e: Partial<TouchEvent>) => void;
    }
    return origAEL.call(this, type, handler, opts);
  });

  const view = render(React.createElement(TestHarness, { onPrev, onNext }));
  spy.mockRestore();

  const mockTouchEvent = (clientX: number, clientY: number) =>
    ({
      touches: [{ clientX, clientY }] as unknown as React.TouchList,
      changedTouches: [{ clientX, clientY }] as unknown as React.TouchList,
      preventDefault: jest.fn(),
    }) as unknown as React.TouchEvent;

  return {
    ...view,
    touchStart: (clientX: number, clientY: number) => {
      act(() => {
        handlers?.handleTouchStart(mockTouchEvent(clientX, clientY));
      });
    },
    touchMove: (clientX: number, clientY: number) => {
      act(() => {
        touchMoveListener?.({
          touches: [{ clientX, clientY }] as unknown as TouchList,
          preventDefault: jest.fn(),
        } as unknown as TouchEvent);
      });
    },
    touchEnd: (clientX: number, clientY: number) => {
      act(() => {
        handlers?.handleTouchEnd(mockTouchEvent(clientX, clientY));
      });
    },
    transitionEnd: (propertyName: string) => {
      act(() => {
        handlers?.handleTransitionEnd({ propertyName } as unknown as React.TransitionEvent);
      });
    },
  };
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('useSwipeNavigation', () => {
  it('containerRef, dragX(0), isTransitioning(false), 핸들러 함수들을 반환한다', () => {
    const { result } = renderHook(() =>
      useSwipeNavigation({ onPrev: jest.fn(), onNext: jest.fn() }),
    );

    expect(result.current.containerRef).toBeDefined();
    expect(result.current.dragX).toBe(0);
    expect(result.current.isTransitioning).toBe(false);
    expect(typeof result.current.handleTouchStart).toBe('function');
    expect(typeof result.current.handleTouchEnd).toBe('function');
    expect(typeof result.current.handleTransitionEnd).toBe('function');
  });

  describe('handleTransitionEnd', () => {
    it('propertyName이 transform이 아니면 onPrev/onNext를 호출하지 않는다', () => {
      const onPrev = jest.fn();
      const { result } = renderHook(() => useSwipeNavigation({ onPrev, onNext: jest.fn() }));

      act(() => {
        result.current.handleTransitionEnd({
          propertyName: 'opacity',
        } as unknown as React.TransitionEvent);
      });

      expect(onPrev).not.toHaveBeenCalled();
    });
  });

  describe('스와이프 흐름', () => {
    it('오른쪽 스와이프 > 임계값(50px) → transitionEnd 후 onPrev 호출', () => {
      const onPrev = jest.fn();
      const onNext = jest.fn();
      const { touchStart, touchMove, touchEnd, transitionEnd } = renderWithCapture(onPrev, onNext);

      touchStart(0, 0);
      touchMove(100, 0); // deltaX=100, deltaY=0 → horizontal
      touchEnd(100, 0);
      transitionEnd('transform');

      expect(onPrev).toHaveBeenCalledTimes(1);
      expect(onNext).not.toHaveBeenCalled();
    });

    it('왼쪽 스와이프 > 임계값(50px) → transitionEnd 후 onNext 호출', () => {
      const onPrev = jest.fn();
      const onNext = jest.fn();
      const { touchStart, touchMove, touchEnd, transitionEnd } = renderWithCapture(onPrev, onNext);

      touchStart(0, 0);
      touchMove(-100, 0); // deltaX=-100, deltaY=0 → horizontal
      touchEnd(-100, 0);
      transitionEnd('transform');

      expect(onNext).toHaveBeenCalledTimes(1);
      expect(onPrev).not.toHaveBeenCalled();
    });

    it('수직 스와이프(|deltaY| > |deltaX|) → navigation 없음', () => {
      const onPrev = jest.fn();
      const onNext = jest.fn();
      const { touchStart, touchMove, touchEnd, transitionEnd } = renderWithCapture(onPrev, onNext);

      touchStart(0, 0);
      touchMove(10, 100); // deltaX=10, deltaY=100 → vertical
      touchEnd(10, 100);
      transitionEnd('transform');

      expect(onPrev).not.toHaveBeenCalled();
      expect(onNext).not.toHaveBeenCalled();
    });

    it('임계값(50px) 미만 수평 스와이프 → navigation 없음', () => {
      const onPrev = jest.fn();
      const onNext = jest.fn();
      const { touchStart, touchMove, touchEnd, transitionEnd } = renderWithCapture(onPrev, onNext);

      touchStart(0, 0);
      touchMove(30, 0); // deltaX=30 < 50
      touchEnd(30, 0);
      transitionEnd('transform');

      expect(onPrev).not.toHaveBeenCalled();
      expect(onNext).not.toHaveBeenCalled();
    });

    it('touchStart 없이 touchEnd가 오면 navigation 없음', () => {
      const onPrev = jest.fn();
      const onNext = jest.fn();
      const { touchEnd, transitionEnd } = renderWithCapture(onPrev, onNext);

      touchEnd(100, 0);
      transitionEnd('transform');

      expect(onPrev).not.toHaveBeenCalled();
      expect(onNext).not.toHaveBeenCalled();
    });
  });
});
