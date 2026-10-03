import { useState } from 'react';
import type { RefObject } from 'react';
import type { Editor } from '@tiptap/core';

const MIN_WIDTH = 100;

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const CORNER_STYLES: Record<Corner, string> = {
  'top-left': 'top-0 left-0 cursor-nw-resize -translate-x-1/2 -translate-y-1/2',
  'top-right': 'top-0 right-0 cursor-ne-resize translate-x-1/2 -translate-y-1/2',
  'bottom-left': 'bottom-0 left-0 cursor-sw-resize -translate-x-1/2 translate-y-1/2',
  'bottom-right': 'bottom-0 right-0 cursor-se-resize translate-x-1/2 translate-y-1/2',
};

interface UseImageResizeOptions {
  imgRef: RefObject<HTMLImageElement | null>;
  width: number | null;
  updateAttributes: (attrs: Record<string, unknown>) => void;
  editor: Editor;
}

function useImageResize({ imgRef, width, updateAttributes, editor }: UseImageResizeOptions) {
  const [resizing, setResizing] = useState(false);

  const handleResizeStart = (corner: Corner) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = imgRef.current?.offsetWidth ?? width ?? 400;
    const flip = corner === 'top-left' || corner === 'bottom-left' ? -1 : 1;
    setResizing(true);

    const containerWidth =
      editor.view.dom.closest('.ProseMirror')?.clientWidth ?? editor.view.dom.clientWidth;

    const onMove = (ev: PointerEvent) => {
      const delta = (ev.clientX - startX) * flip;
      const next = Math.max(MIN_WIDTH, Math.min(startWidth + delta, containerWidth));
      updateAttributes({ width: Math.round(next) });
    };

    const onUp = () => {
      setResizing(false);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  return { resizing, handleResizeStart };
}

export { useImageResize, CORNER_STYLES, type Corner };
