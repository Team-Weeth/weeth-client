import { cn } from '@/lib/cn';
import { useDragScroll, useScrollOnGrow } from '@/hooks';
import type { FileItem } from '@/stores/usePostStore';
import { ImageCard } from './ImageCard';

type ImageListProps = {
  files: FileItem[];
} & (
  | { removable: true; onRemove: (id: string, fileUrl: string) => void }
  | { removable?: false; onRemove?: never }
);

export function ImageList({ files, removable, onRemove }: ImageListProps) {
  const { ref, scrollToEnd, ...scrollHandlers } = useDragScroll();

  useScrollOnGrow(files.length, scrollToEnd);

  if (files.length === 0) return null;

  // 1개: 원본 비율 유지, max-height 제한
  if (files.length === 1) {
    return (
      <div className="self-stretch">
        <ImageCard
          item={files[0]}
          className="inline-block min-h-[80px] max-w-full min-w-[80px]"
          imgClassName="max-h-[320px] max-w-full object-contain"
          removable={removable}
          onRemove={onRemove}
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
          className={cn('shrink-0 self-stretch', index === files.length - 1 && 'mr-800')}
          imgClassName="h-full w-auto object-cover"
          removable={removable}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
