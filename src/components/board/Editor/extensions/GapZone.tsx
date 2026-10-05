'use client';

import { useState } from 'react';

interface GapZoneProps {
  isEditable: boolean;
  onInsert: () => void;
}

function GapZone({ isEditable, onInsert }: GapZoneProps) {
  const [hover, setHover] = useState(false);

  if (!isEditable) return null;

  return (
    <div
      className="relative h-500 w-full cursor-text"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onDragOver={(e) => e.preventDefault()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={onInsert}
    >
      {hover && (
        <div className="bg-line pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2" />
      )}
    </div>
  );
}

export { GapZone };
