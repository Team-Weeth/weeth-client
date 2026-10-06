'use client';

import { cn } from '@/lib/cn';
import { AlignLeft, AlignCenter, AlignRight, Trash2, Ungroup } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/Tooltip';

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

interface ImageToolbarBaseProps {
  toolbarBelow?: boolean;
  onDelete: () => void;
}

interface ImageToolbarImageProps extends ImageToolbarBaseProps {
  mode: 'image';
  textAlign: TextAlign;
  onAlign: (align: TextAlign) => void;
}

interface ImageToolbarGroupProps extends ImageToolbarBaseProps {
  mode: 'group';
  onUngroup: () => void;
}

type ImageToolbarProps = ImageToolbarImageProps | ImageToolbarGroupProps;

function ImageToolbar({ toolbarBelow = false, onDelete, ...rest }: ImageToolbarProps) {
  return (
    <TooltipProvider>
      <div
        className={cn(
          'border-line bg-container-neutral absolute left-1/2 z-20 flex -translate-x-1/2 items-center rounded-md border p-100 shadow-md',
          'transition-all duration-150',
          toolbarBelow ? 'top-full mt-200' : 'bottom-full mb-200',
        )}
      >
        {rest.mode === 'image' ? (
          ALIGN_ITEMS.map(({ value, label, icon: Icon }) => (
            <Tooltip key={value}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => rest.onAlign(value)}
                  className={cn(
                    'cursor-pointer rounded px-200 py-100 transition-colors',
                    rest.textAlign === value
                      ? 'text-brand-primary'
                      : 'text-icon-alternative hover:bg-container-neutral-interaction',
                  )}
                  aria-label={label}
                >
                  <Icon size={ICON_SIZE} />
                </button>
              </TooltipTrigger>
              <TooltipContent variant="dark">{label}</TooltipContent>
            </Tooltip>
          ))
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={rest.onUngroup}
                className="text-icon-alternative hover:bg-container-neutral-interaction cursor-pointer rounded px-200 py-100 transition-colors"
                aria-label="그룹 해제"
              >
                <Ungroup size={ICON_SIZE} />
              </button>
            </TooltipTrigger>
            <TooltipContent variant="dark">그룹 해제</TooltipContent>
          </Tooltip>
        )}
        <div className="bg-line mx-100 h-4 w-px" />
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onDelete}
              className="text-state-error hover:bg-container-neutral-interaction cursor-pointer rounded px-200 py-100 transition-colors"
              aria-label={rest.mode === 'group' ? '그룹 삭제' : '이미지 삭제'}
            >
              <Trash2 size={ICON_SIZE} />
            </button>
          </TooltipTrigger>
          <TooltipContent variant="dark">
            {rest.mode === 'group' ? '그룹 삭제' : '이미지 삭제'}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export { ImageToolbar, type ImageToolbarProps };
