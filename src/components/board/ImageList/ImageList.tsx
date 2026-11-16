'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

import { useDragScroll } from '@/hooks/useDragScroll';
import { useScrollOnGrow } from '@/hooks/useScrollOnGrow';
import { cn } from '@/lib/cn';
import type { DisplayFile } from '@/types/board';

import { ImageCard } from './ImageCard';

const FullscreenImageViewer = dynamic(
  () =>
    import('@/components/ui/FullscreenImageViewer').then((mod) => ({
      default: mod.FullscreenImageViewer,
    })),
  { ssr: false },
);

type ImageListProps = {
  files: DisplayFile[];
  size?: 'default' | 'compact';
  viewable?: boolean;
  /** 뷰어 하단 썸네일 미리보기 리스트 표시 여부 */
  showThumbnails?: boolean;
  /** Set true for the first above-the-fold image list to mark the first image as LCP */
  priority?: boolean;
} & (
  | { removable: true; onRemove: (id: string | number, fileUrl: string) => void }
  | { removable?: false; onRemove?: never }
);

function ImageList({
  files,
  size = 'default',
  viewable,
  showThumbnails,
  removable,
  onRemove,
  priority = false,
}: ImageListProps) {
  const { ref, scrollToEnd, ...scrollHandlers } = useDragScroll();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerKey, setViewerKey] = useState(0);

  useScrollOnGrow(files.length, scrollToEnd);

  if (files.length === 0) return null;

  const openViewer = viewable
    ? (index: number) => {
        setViewerIndex(index);
        setViewerKey((k) => k + 1);
        setViewerOpen(true);
      }
    : undefined;

  const images = files.map((f) => ({ url: f.fileUrl, alt: f.fileName, fileName: f.fileName }));

  function renderLayout() {
    // 입력창 내 미리보기: 작은 썸네일, 드래그 스크롤
    if (size === 'compact') {
      return (
        <div
          ref={ref}
          role="region"
          aria-label="첨부된 이미지 목록"
          className="flex gap-200 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
          {...scrollHandlers}
        >
          {files.map((item, index) => (
            <ImageCard
              key={item.id}
              item={item}
              className="h-[72px] w-[72px] shrink-0"
              imgClassName="object-cover"
              sizes="72px"
              removable={removable}
              onRemove={onRemove}
              onClick={openViewer ? () => openViewer(index) : undefined}
            />
          ))}
        </div>
      );
    }

    // 1개: 고정 높이 컨테이너에서 비율 유지 (fill + object-contain)
    if (files.length === 1) {
      return (
        <div className="self-stretch">
          <ImageCard
            item={files[0]}
            className="h-[182px] w-full"
            imgClassName="object-contain"
            sizes="(max-width: 696px) calc(100vw - 32px), 832px"
            removable={removable}
            onRemove={onRemove}
            onClick={openViewer ? () => openViewer(0) : undefined}
            priority={priority}
          />
        </div>
      );
    }

    // 2개 이상: 고정 높이, 넘치면 드래그 스크롤
    return (
      <div
        ref={ref}
        tabIndex={0}
        role="region"
        aria-label="첨부된 이미지 목록"
        className="-mx-800 flex h-[182px] cursor-grab gap-200 self-stretch overflow-x-auto pl-800 [-ms-overflow-style:none] [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
        {...scrollHandlers}
      >
        {files.map((item, index) => (
          <ImageCard
            key={item.id}
            item={item}
            className={cn(
              'w-[182px] min-w-[60px] shrink-0 self-stretch',
              index === files.length - 1 && 'mr-800',
            )}
            imgClassName="object-cover"
            sizes="(max-width: 696px) calc(50vw - 20px), 250px"
            removable={removable}
            onRemove={onRemove}
            onClick={openViewer ? () => openViewer(index) : undefined}
            priority={priority && index === 0}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      {renderLayout()}
      {viewable && (
        <FullscreenImageViewer
          key={viewerKey}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          images={images}
          initialIndex={viewerIndex}
          showThumbnails={showThumbnails}
        />
      )}
    </>
  );
}

export { ImageList, type ImageListProps };
