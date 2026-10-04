'use client';

import { useState } from 'react';
import type { Node } from '@tiptap/pm/model';

interface GapZoneProps {
  isEditable: boolean;
  adjacentNode: Node | null;
  onInsert: () => void;
}

function GapZone({ isEditable, adjacentNode: _adjacentNode, onInsert }: GapZoneProps) {
  const [hover, setHover] = useState(false);
  const showLine = hover && isEditable;

  return (
    <div
      className="relative h-500 w-full cursor-text"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onDragOver={(e) => e.preventDefault()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={onInsert}
    >
      {showLine && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-neutral-500" />
      )}
    </div>
  );
}

export { GapZone };
