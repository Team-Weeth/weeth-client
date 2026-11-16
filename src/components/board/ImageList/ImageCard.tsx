'use client';

import NextImage from 'next/image';
import CloseCircleIcon from '@/assets/icons/close_circle.svg';
import { Icon } from '@/components/ui/Icon';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { cn } from '@/lib/cn';
import type { DisplayFile } from '@/types/board';

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
      onClick={(e) => {
        e.stopPropagation();
        onRemove(id, fileUrl);
      }}
      aria-label={`${fileName} 삭제`}
      className="absolute top-0 right-0 flex h-5 w-5 cursor-pointer items-center justify-center"
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
  onClick?: () => void;
  /** next/image sizes attribute — pass the expected CSS display width for srcset selection */
  sizes?: string;
  /** Set true for the LCP image to add fetchpriority="high" and disable lazy loading */
  priority?: boolean;
}

function ImageCard({
  item,
  className,
  imgClassName,
  removable,
  onRemove,
  onClick,
  sizes = '100vw',
  priority = false,
}: ImageCardProps) {
  const isLocal = item.uploaded === false;

  const inner = (
    <>
      {isLocal ? (
        // Blob / local preview: next/image cannot optimize local object URLs
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.fileUrl}
          alt={item.fileName}
          draggable={false}
          loading="eager"
          data-loading="true"
          className={cn('h-full w-full opacity-50', imgClassName)}
        />
      ) : (
        <NextImage
          src={item.fileUrl}
          alt={item.fileName}
          width={0}
          height={0}
          sizes={sizes}
          draggable={false}
          priority={priority}
          className={cn('h-full w-full', imgClassName)}
        />
      )}

      {item.uploaded === false && <LoadingOverlay label="이미지 업로드 중" />}

      {removable && onRemove && (
        <RemoveButton
          id={item.id}
          fileName={item.fileName}
          fileUrl={item.fileUrl}
          onRemove={onRemove}
        />
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'relative cursor-pointer overflow-hidden rounded-sm border-0 bg-transparent p-0',
          className,
        )}
      >
        {inner}
      </button>
    );
  }

  return <div className={cn('relative overflow-hidden rounded-sm', className)}>{inner}</div>;
}

export { ImageCard, type ImageCardProps };
