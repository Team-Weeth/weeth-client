import { useRef, useCallback, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { FileItem } from '@/stores/usePostStore';

type ImageGridProps = {
  files: FileItem[];
} & (
  | { removable: true; onRemove: (id: string, fileUrl: string) => void }
  | { removable?: false; onRemove?: never }
);

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
      className="bg-text-alternative text-text-inverse hover:bg-text-normal absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full"
    >
      <X size={10} strokeWidth={3} />
    </button>
  );
}

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
    </div>
  );
}

function ImageCard({
  item,
  className,
  imgClassName,
  removable,
  onRemove,
}: {
  item: FileItem;
  className?: string;
  imgClassName?: string;
  removable?: boolean;
  onRemove?: (id: string, fileUrl: string) => void;
}) {
  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ borderRadius: 'var(--radius-sm, 8px)' }}
    >
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

function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const state = useRef({ isDown: false, startX: 0, scrollLeft: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    state.current = { isDown: true, startX: e.pageX, scrollLeft: el.scrollLeft };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!state.current.isDown) return;
    e.preventDefault();
    const el = ref.current;
    if (!el) return;
    el.scrollLeft = state.current.scrollLeft - (e.pageX - state.current.startX);
  }, []);

  const onMouseUp = useCallback(() => {
    state.current.isDown = false;
  }, []);

  const SCROLL_STEP = 200;

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    const el = ref.current;
    if (!el) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      el.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' });
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      el.scrollBy({ left: -SCROLL_STEP, behavior: 'smooth' });
    }
  }, []);

  const scrollToEnd = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const images = el.querySelectorAll<HTMLImageElement>('img');
    const lastImg = images[images.length - 1];

    const doScroll = () => el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });

    if (lastImg && !lastImg.complete) {
      lastImg.addEventListener('load', doScroll, { once: true });
    } else {
      requestAnimationFrame(doScroll);
    }
  }, []);

  return {
    ref,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave: onMouseUp,
    onKeyDown,
    scrollToEnd,
  };
}

export function ImageGrid({ files, removable, onRemove }: ImageGridProps) {
  const { ref, scrollToEnd, ...scrollHandlers } = useDragScroll();

  // 새 이미지 추가 시 끝으로 스크롤
  const prevCount = useRef(files.length);
  useEffect(() => {
    if (files.length > prevCount.current) {
      scrollToEnd();
    }
    prevCount.current = files.length;
  }, [files.length, scrollToEnd]);

  if (files.length === 0) return null;

  // 1개: 원본 비율 유지, max-height 제한
  if (files.length === 1) {
    return (
      <div className="self-stretch">
        <ImageCard
          item={files[0]}
          className="inline-block max-w-full"
          imgClassName="max-h-[320px] max-w-full object-contain"
          removable={removable}
          onRemove={onRemove}
        />
      </div>
    );
  }

  // 2개 이상: 고정 높이, 원본 비율 유지, 넘치면 드래그 스크롤
  return (
    <div
      ref={ref}
      tabIndex={0}
      className="-mx-800 flex h-[182px] cursor-grab gap-200 self-stretch overflow-x-auto pl-800 [-ms-overflow-style:none] [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
      {...scrollHandlers}
    >
      {files.map((item, index) => (
        <ImageCard
          key={item.id}
          item={item}
          className={cn('shrink-0 self-stretch', index === files.length - 1 && 'mr-800')}
          imgClassName="h-full w-auto object-cover"
          removable={removable}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
