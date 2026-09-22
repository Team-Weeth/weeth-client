'use client';

import { useState } from 'react';

import { FullscreenImageViewer } from '@/components/ui/FullscreenImageViewer';
import { useDragScroll } from '@/hooks/useDragScroll';
import { useScrollOnGrow } from '@/hooks/useScrollOnGrow';
import { cn } from '@/lib/cn';
import type { DisplayFile } from '@/types/board';

import { ImageCard } from './ImageCard';

type ImageListProps = {
  files: DisplayFile[];
  size?: 'default' | 'compact';
  viewable?: boolean;
  /** 뷰어 하단 썸네일 미리보기 리스트 표시 여부 */
  showThumbnails?: boolean;
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
              imgClassName="h-full w-full object-cover"
              removable={removable}
              onRemove={onRemove}
              onClick={openViewer ? () => openViewer(index) : undefined}
            />
          ))}
        </div>
      );
    }

    // 1개: 원본 비율 유지, max-height 제한
    if (files.length === 1) {
      return (
        <div className="self-stretch">
          <ImageCard
            item={files[0]}
            className="inline-block max-w-full"
            imgClassName="max-h-[182px] max-w-full object-contain"
            removable={removable}
            onRemove={onRemove}
            onClick={openViewer ? () => openViewer(0) : undefined}
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
              'min-w-[60px] shrink-0 self-stretch',
              index === files.length - 1 && 'mr-800',
            )}
            imgClassName="h-full max-w-full object-contain"
            removable={removable}
            onRemove={onRemove}
            onClick={openViewer ? () => openViewer(index) : undefined}
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
