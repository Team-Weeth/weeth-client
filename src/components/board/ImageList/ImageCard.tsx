'use client';

import type { StaticImageData } from 'next/image';
import { CloseCircleIcon } from '@/assets/icons';
import { cn } from '@/lib/cn';
import type { FileItem } from '@/stores/usePostStore';

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
  id: string;
  fileName: string;
  fileUrl: string;
  onRemove: (id: string, fileUrl: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onRemove(id, fileUrl)}
      aria-label={`${fileName} 삭제`}
      className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center"
    >
      <span
        aria-hidden="true"
        className="bg-icon-normal block h-5 w-5 mask-contain mask-center mask-no-repeat"
        style={{
          maskImage: `url(${(CloseCircleIcon as StaticImageData).src})`,
          WebkitMaskImage: `url(${(CloseCircleIcon as StaticImageData).src})`,
        }}
      />
    </button>
  );
}

interface ImageCardProps {
  item: FileItem;
  className?: string;
  imgClassName?: string;
  removable?: boolean;
  onRemove?: (id: string, fileUrl: string) => void;
}

function ImageCard({ item, className, imgClassName, removable, onRemove }: ImageCardProps) {
  return (
    <div className={cn('relative overflow-hidden rounded-sm', className)}>
      {/* TODO: API 연결 후 blob URL → 실제 URL로 변경되면 next/image로 교체 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.fileUrl}
        alt={item.fileName}
        className={cn(imgClassName, !item.uploaded && 'opacity-50')}
        draggable={false}
      />
      {!item.uploaded && <LoadingOverlay />}
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
