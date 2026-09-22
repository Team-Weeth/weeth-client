'use client';

import { useRef } from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';

import ArrowLeftIcon from '@/assets/icons/arrow_left.svg';
import ArrowRightIcon from '@/assets/icons/arrow_right.svg';
import DeleteIcon from '@/assets/icons/delete.svg';
import DownloadIcon from '@/assets/icons/download.svg';
import FitScreenIcon from '@/assets/icons/fit_screen.svg';
import ZoomInIcon from '@/assets/icons/zoom_in.svg';
import ZoomOutIcon from '@/assets/icons/zoom_out.svg';
import { Icon } from '@/components/ui/Icon';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { useImageViewer, ZOOM_MIN, ZOOM_MAX } from '@/hooks/useImageViewer';
import {
  useWheelZoom,
  useDragPan,
  useTouchGestures,
  usePreloadImages,
  useThumbnailScroll,
} from '@/hooks/useImageViewerGestures';
import { cn } from '@/lib/cn';

interface FullscreenImageViewerImage {
  url: string;
  alt?: string;
  fileName?: string;
}

interface FullscreenImageViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: FullscreenImageViewerImage[];
  initialIndex?: number;
  /** 하단 썸네일 미리보기 리스트 표시 여부 */
  showThumbnails?: boolean;
}

function downloadImage(url: string, fileName: string) {
  const params = new URLSearchParams({ url, fileName });
  const link = document.createElement('a');
  link.href = `/api/download?${params.toString()}`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

interface TooltipIconButtonProps {
  src: React.ComponentProps<typeof Icon>['src'];
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function TooltipIconButton({ src, label, onClick, disabled }: TooltipIconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className="cursor-pointer p-100 text-white transition-opacity hover:opacity-70 disabled:cursor-default disabled:opacity-30"
          aria-label={label}
        >
          <Icon src={src} size={20} />
        </button>
      </TooltipTrigger>
      <TooltipContent variant="dark" side="top">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function FullscreenImageViewer({
  open,
  onOpenChange,
  images,
  initialIndex = 0,
  showThumbnails = false,
}: FullscreenImageViewerProps) {
  const imageAreaRef = useRef<HTMLDivElement>(null);
  const thumbnailRef = useRef<HTMLDivElement>(null);

  const imageCount = images.length;

  const viewer = useImageViewer({ imageCount, initialIndex, open });
  const activeImage = images[viewer.activeIndex];

  // 마우스 휠 줌 — zoom state를 직접 전달
  useWheelZoom(imageAreaRef, open, viewer.setZoom);

  // 드래그 패닝
  useDragPan(imageAreaRef, open, viewer.zoomRef, viewer.panRef, viewer.setPan);

  // 터치 스와이프 + 핀치 줌
  useTouchGestures(
    imageAreaRef,
    open,
    viewer.zoomRef,
    viewer.setZoom,
    viewer.handlePrev,
    viewer.handleNext,
  );

  // 인접 이미지 프리로드
  usePreloadImages(images, viewer.activeIndex, open);

  // 썸네일 자동 스크롤
  const showThumbnailStrip = showThumbnails && viewer.hasMultipleImages;
  useThumbnailScroll(thumbnailRef, viewer.activeIndex, showThumbnailStrip);

  if (!activeImage) return null;

  const imageTransform =
    viewer.zoom === 1 && viewer.pan.x === 0 && viewer.pan.y === 0
      ? undefined
      : `scale(${viewer.zoom}) translate(${viewer.pan.x / viewer.zoom}px, ${viewer.pan.y / viewer.zoom}px)`;

  const zoomControls: TooltipIconButtonProps[] = [
    {
      src: ZoomOutIcon,
      label: '축소',
      onClick: viewer.handleZoomOut,
      disabled: viewer.zoom <= ZOOM_MIN,
    },
    {
      src: ZoomInIcon,
      label: '확대',
      onClick: viewer.handleZoomIn,
      disabled: viewer.zoom >= ZOOM_MAX,
    },
    {
      src: FitScreenIcon,
      label: '화면에 맞추기',
      onClick: viewer.handleFitScreen,
    },
  ];

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(v) => viewer.handleOpenChange(v, onOpenChange)}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-[90] bg-black/80" />
        {/* target === currentTarget: 배경 클릭 시에만 닫힘 — 자식마다 stopPropagation 불필요 */}
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-[90] flex flex-col outline-none"
          onClick={(e) => {
            if (e.target !== e.currentTarget) return;
            if (viewer.zoom > 1) return;
            viewer.handleOpenChange(false, onOpenChange);
          }}
        >
          {/* Header */}
          <div className="relative z-10 flex h-14 shrink-0 items-center px-400">
            <DialogPrimitive.Title
              className={cn('typo-sub3 text-white', !viewer.hasMultipleImages && 'sr-only')}
            >
              {viewer.hasMultipleImages ? `${viewer.activeIndex + 1}/${imageCount}` : '이미지'}
            </DialogPrimitive.Title>

            {/* Right: download + close */}
            <div className="ml-auto flex items-center gap-100">
              <button
                type="button"
                onClick={() =>
                  downloadImage(
                    activeImage.url,
                    activeImage.fileName ?? `image-${viewer.activeIndex + 1}`,
                  )
                }
                className="cursor-pointer p-200 text-white transition-opacity hover:opacity-70"
                aria-label="이미지 다운로드"
              >
                <Icon src={DownloadIcon} size={24} />
              </button>
              <DialogPrimitive.Close
                className="cursor-pointer p-200 text-white transition-opacity hover:opacity-70"
                aria-label="이미지 닫기"
              >
                <Icon src={DeleteIcon} size={26} />
              </DialogPrimitive.Close>
            </div>
          </div>

          {/* Image area */}
          <div
            ref={imageAreaRef}
            className={cn(
              'group relative flex min-h-0 flex-1 items-center justify-center overflow-hidden pb-600',
              viewer.zoom > 1 ? 'cursor-grab' : 'cursor-default',
            )}
          >
            {viewer.hasMultipleImages && (
              <button
                type="button"
                onClick={viewer.handlePrev}
                onPointerDown={(e) => e.stopPropagation()}
                className="absolute left-400 z-10 flex size-9 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white transition-opacity hover:bg-black/60"
                aria-label="이전 이미지 보기"
              >
                <Icon src={ArrowLeftIcon} size={16} />
              </button>
            )}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage.url}
              alt={activeImage.alt ?? `이미지 ${viewer.activeIndex + 1}`}
              className="max-h-full max-w-full object-contain px-800 transition-transform duration-200 select-none"
              style={imageTransform ? { transform: imageTransform } : undefined}
              draggable={false}
            />

            {/* Zoom controls — visible on hover */}
            <div
              className="absolute inset-x-0 bottom-800 z-10 flex justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <TooltipProvider>
                <div className="flex items-center gap-200 rounded-full bg-black/60 px-400 pt-200 pb-100">
                  {zoomControls.map((control) => (
                    <TooltipIconButton key={control.label} {...control} />
                  ))}
                </div>
              </TooltipProvider>
            </div>

            {viewer.hasMultipleImages && (
              <button
                type="button"
                onClick={viewer.handleNext}
                onPointerDown={(e) => e.stopPropagation()}
                className="absolute right-400 z-10 flex size-9 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white transition-opacity hover:bg-black/60"
                aria-label="다음 이미지 보기"
              >
                <Icon src={ArrowRightIcon} size={16} />
              </button>
            )}
          </div>

          {/* Thumbnail strip */}
          {showThumbnailStrip && (
            <div className="shrink-0 px-400 pt-200 pb-400">
              <div
                ref={thumbnailRef}
                role="list"
                aria-label="이미지 미리보기 목록"
                className="flex items-center justify-center gap-100 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {images.map((image, index) => (
                  <button
                    key={`thumb-${index}`}
                    type="button"
                    role="listitem"
                    onClick={() => viewer.handleThumbnailSelect(index)}
                    className={cn(
                      'size-11 shrink-0 cursor-pointer overflow-hidden rounded-sm transition-opacity',
                      index === viewer.activeIndex ? 'opacity-100' : 'opacity-40 hover:opacity-70',
                    )}
                    aria-label={`이미지 ${index + 1} 보기`}
                    aria-current={index === viewer.activeIndex ? 'true' : undefined}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.url}
                      alt={image.alt ?? `미리보기 ${index + 1}`}
                      className="size-full object-cover"
                      draggable={false}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export { FullscreenImageViewer, type FullscreenImageViewerProps, type FullscreenImageViewerImage };
