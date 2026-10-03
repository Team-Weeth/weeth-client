'use client';

import { cn } from '@/lib/cn';
import { AlignLeft, AlignCenter, AlignRight, Trash2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type TextAlign = 'left' | 'center' | 'right';

interface AlignItem {
  value: TextAlign;
  label: string;
  icon: LucideIcon;
}

const ALIGN_ITEMS: AlignItem[] = [
  { value: 'left', label: '왼쪽 정렬', icon: AlignLeft },
  { value: 'center', label: '가운데 정렬', icon: AlignCenter },
  { value: 'right', label: '오른쪽 정렬', icon: AlignRight },
];

const ICON_SIZE = 15;

interface ImageToolbarProps {
  textAlign: TextAlign;
  toolbarBelow: boolean;
  onAlign: (align: TextAlign) => void;
  onDelete: () => void;
}

function ImageToolbar({ textAlign, toolbarBelow, onAlign, onDelete }: ImageToolbarProps) {
  return (
    <div
      className={cn(
        'border-line bg-container-neutral absolute left-1/2 z-20 flex -translate-x-1/2 items-center rounded-md border p-100 shadow-md',
        toolbarBelow ? 'top-full mt-200' : 'bottom-full mb-200',
      )}
    >
      {ALIGN_ITEMS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onAlign(value)}
          className={cn(
            'cursor-pointer rounded px-200 py-100 transition-colors',
            textAlign === value
              ? 'text-brand-primary'
              : 'text-icon-alternative hover:bg-container-neutral-interaction',
          )}
          aria-label={label}
        >
          <Icon size={ICON_SIZE} />
        </button>
      ))}
      <div className="bg-line mx-100 h-4 w-px" />
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onDelete}
        className="text-state-error hover:bg-container-neutral-interaction cursor-pointer rounded px-200 py-100 transition-colors"
        aria-label="이미지 삭제"
      >
        <Trash2 size={ICON_SIZE} />
      </button>
    </div>
  );
}

export { ImageToolbar, type ImageToolbarProps };
