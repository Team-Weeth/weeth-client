'use client';

import React, { useEffect, useState } from 'react';

import { AdminCloseIcon } from '@/assets/icons/admin';
import { SelectedCountLabel } from '@/components/admin/SelectedCountLabel';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';

interface FloatingSelectionBarProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedCount: number;
  visible?: boolean;
  onClear: () => void;
  countLabel?: string;
  clearLabel?: string;
  children: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}

const ANIMATION_MS = 450;

function FloatingSelectionBar({
  className,
  selectedCount,
  visible = selectedCount > 0,
  onClear,
  countLabel = '명 선택됨',
  clearLabel = '선택 해제',
  children,
  ref,
  style,
  ...props
}: FloatingSelectionBarProps) {
  const [shouldRender, setShouldRender] = useState(visible);
  const [isAnimatedVisible, setIsAnimatedVisible] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(selectedCount);
  const [displayedChildren, setDisplayedChildren] = useState(children);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      if (selectedCount > 0) setDisplayedCount(selectedCount);
      setDisplayedChildren(children);
      return;
    }

    setIsAnimatedVisible(false);
    const timeout = window.setTimeout(() => setShouldRender(false), ANIMATION_MS);
    return () => window.clearTimeout(timeout);
  }, [children, selectedCount, visible]);

  useEffect(() => {
    if (!shouldRender || !visible) return;

    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setIsAnimatedVisible(true));
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [shouldRender, visible]);

  if (!shouldRender) return null;

  return (
    <div
      ref={ref}
      aria-hidden={!isAnimatedVisible}
      inert={!isAnimatedVisible}
      className={cn(
        'scrollbar-none bg-container-floating border-floating-border fixed bottom-10 left-1/2 z-30 flex max-w-[calc(100%-32px)] items-center gap-[10px] overflow-x-auto rounded-lg border px-400 py-300 shadow-md will-change-[transform,opacity]',
        isAnimatedVisible ? 'pointer-events-auto' : 'pointer-events-none',
        className,
      )}
      style={{
        transform: `translate(-50%, ${isAnimatedVisible ? '0' : 'calc(100% + 40px)'})`,
        opacity: isAnimatedVisible ? 1 : 0,
        transition: `transform ${ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${ANIMATION_MS}ms ease`,
        ...style,
      }}
      {...props}
    >
      <SelectedCountLabel count={displayedCount} label={countLabel} />

      <div className="flex shrink-0 items-center gap-[10px]">
        {visible ? children : displayedChildren}
      </div>

      <div className="flex shrink-0 items-start pl-0.5">
        <button
          type="button"
          onClick={onClear}
          className="flex size-8 cursor-pointer items-center justify-center rounded-sm p-100"
          aria-label={clearLabel}
        >
          <Icon src={AdminCloseIcon} size={24} className="text-icon-on-floating" alt={clearLabel} />
        </button>
      </div>
    </div>
  );
}

export { FloatingSelectionBar, type FloatingSelectionBarProps };
