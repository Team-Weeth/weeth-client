'use client';

import { CloseCircleIcon } from '@/assets/icons';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { DisplayFile } from '@/types/board';

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
    </div>
  );
}

function RemoveButton({
  id,
  fileName,
  fileUrl,
  onRemove,
}: {
  id: string | number;
  fileName: string;
  fileUrl: string;
  onRemove: (id: string | number, fileUrl: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onRemove(id, fileUrl)}
      aria-label={`${fileName} 삭제`}
      className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center"
    >
      <Icon src={CloseCircleIcon} size={20} className="text-icon-normal" />
    </button>
  );
}

interface ImageCardProps {
  item: DisplayFile;
  className?: string;
  imgClassName?: string;
  removable?: boolean;
  onRemove?: (id: string | number, fileUrl: string) => void;
}

function ImageCard({ item, className, imgClassName, removable, onRemove }: ImageCardProps) {
  return (
    <div className={cn('relative overflow-hidden rounded-sm', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.fileUrl}
        alt={item.fileName}
        draggable={false}
        className={cn(item.uploaded === false && 'opacity-50', imgClassName)}
      />

      {item.uploaded === false && <LoadingOverlay />}

      {removable && onRemove && (
        <RemoveButton
          id={item.id}
          fileName={item.fileName}
          fileUrl={item.fileUrl}
          onRemove={onRemove}
        />
      )}
    </div>
  );
}

export { ImageCard, type ImageCardProps };
