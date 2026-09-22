'use client';

import { useEffect, useState, type CSSProperties } from 'react';

const ANIMATION_MS = 420;
const EXIT_OPACITY_MS = 560;
const ENTER_CONTENT_DELAY_MS = 60;
const EXIT_LAYOUT_DELAY_MS = 80;
const EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';

/**
 * 모바일 선택 바의 등장/퇴장 전환 상태를 관리한다.
 * 퇴장 애니메이션이 끝날 때까지 마지막 선택 개수를 유지해 숫자가 0으로 깜빡이지 않게 한다.
 */
function useSelectionBarTransition(selectedCount: number) {
  const isVisible = selectedCount > 0;
  const [isExiting, setIsExiting] = useState(false);
  const [isAnimatedVisible, setIsAnimatedVisible] = useState(false);
  const [displayedSelectedCount, setDisplayedSelectedCount] = useState(selectedCount);
  const [wasVisible, setWasVisible] = useState(isVisible);

  // 표시 여부가 바뀐 프레임에 파생 상태를 렌더 중 맞춘다.
  if (wasVisible !== isVisible) {
    setWasVisible(isVisible);
    setIsExiting(!isVisible);
    if (!isVisible) setIsAnimatedVisible(false);
  }

  if (isVisible && displayedSelectedCount !== selectedCount) {
    setDisplayedSelectedCount(selectedCount);
  }

  useEffect(() => {
    if (!isExiting) return;

    const timeout = window.setTimeout(
      () => setIsExiting(false),
      EXIT_OPACITY_MS + EXIT_LAYOUT_DELAY_MS,
    );

    return () => window.clearTimeout(timeout);
  }, [isExiting]);

  useEffect(() => {
    if (!isVisible) return;

    // 마운트 직후 두 프레임을 기다려야 0fr → 1fr 전환이 실제로 재생된다.
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setIsAnimatedVisible(true));
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [isVisible]);

  // 높이(레이아웃)와 콘텐츠(이동/투명도)에 서로 다른 지연을 줘서 밀려나는 느낌을 만든다.
  const layoutStyle: CSSProperties = {
    gridTemplateRows: isAnimatedVisible ? '1fr' : '0fr',
    transition: `grid-template-rows ${ANIMATION_MS}ms ${EASING} ${isVisible ? '0ms' : `${EXIT_LAYOUT_DELAY_MS}ms`}`,
  };

  const contentStyle: CSSProperties = {
    transform: `translateY(${isAnimatedVisible ? '0' : '22px'})`,
    opacity: isAnimatedVisible ? 1 : 0,
    transition: `transform ${ANIMATION_MS}ms ${EASING} ${isVisible ? `${ENTER_CONTENT_DELAY_MS}ms` : '0ms'}, opacity ${isVisible ? ANIMATION_MS : EXIT_OPACITY_MS}ms ${EASING} ${isVisible ? `${ENTER_CONTENT_DELAY_MS}ms` : '0ms'}`,
  };

  return {
    isVisible,
    shouldRender: isVisible || isExiting,
    isAnimatedVisible,
    effectiveSelectedCount: isVisible ? selectedCount : displayedSelectedCount,
    layoutStyle,
    contentStyle,
  };
}

export { useSelectionBarTransition };
