'use client';

import { useState, useEffect } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { cn } from '@/lib/cn';
import { useLineClamp } from '@/hooks/useLineClamp';
import { FullscreenImageViewer } from '@/components/ui/FullscreenImageViewer';
import type { FullscreenImageViewerImage } from '@/components/ui/FullscreenImageViewer';

import { ExpandButton } from './ExpandButton';

interface PostCardBodyProps {
  className?: string;
  content: string;
  expandable?: boolean;
}

function PostCardBody({ className, content, expandable = false }: PostCardBodyProps) {
  const sanitized = DOMPurify.sanitize(content, {
    ADD_TAGS: ['figure'],
    ADD_ATTR: [
      'target',
      'rel',
      'colwidth',
      'data-file-attachment',
      'data-src',
      'data-file-name',
      'data-file-size',
      'data-content-type',
      'data-text-align',
      'data-image-group',
    ],
  });

  const { ref, isClamped, isExpanded, setIsExpanded } = useLineClamp<HTMLDivElement>(
    expandable,
    sanitized,
  );

  // alt 속성이 없는 img 요소에 alt="" 를 추가한다.
  // DOM 직접 조작(외부 시스템 업데이트) — setState 를 호출하지 않아 cascade 렌더 없음.
  useEffect(() => {
    if (!ref.current) return;
    ref.current.querySelectorAll<HTMLImageElement>('img:not([alt])').forEach((img) => {
      img.setAttribute('alt', '');
    });
  }, [sanitized, ref]);

  const [allImages, setAllImages] = useState<FullscreenImageViewerImage[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const img = (e.target as HTMLElement).closest<HTMLImageElement>('img[src]');
    if (!img) return;
    const src = img.getAttribute('src');
    if (!src) return;
    if (!ref.current) return;
    // 클릭 시점에 렌더된 DOM 에서 이미지 목록 추출 (alt 보정 이후 상태 반영).
    const images = Array.from(ref.current.querySelectorAll<HTMLImageElement>('img[src]')).map(
      (el) => ({
        url: el.getAttribute('src')!,
        alt: el.getAttribute('alt') ?? undefined,
      }),
    );
    const index = images.findIndex((i) => i.url === src);
    if (index === -1) return;
    setAllImages(images);
    setViewerIndex(index);
    setViewerOpen(true);
  };

  return (
    <>
      <div
        ref={ref}
        className={cn('self-stretch', expandable && !isExpanded && 'line-clamp-8 overflow-hidden')}
      >
        {/* ProseMirror 클래스를 유지해 globals.css 의 에디터 스타일(.ProseMirror *)이 그대로 적용된다.
            data-image-group 의 CSS 폴백(renderHTML fallback)도 이 셀렉터에 이미 정의되어 있다. */}
        <div
          className={cn(
            'ProseMirror prose-readonly text-text-normal typo-body1 w-full max-w-[900px] self-stretch whitespace-pre-line',
            '[&_img]:cursor-pointer',
            className,
          )}
          dangerouslySetInnerHTML={{ __html: sanitized }}
          onClick={handleClick}
        />
      </div>
      {expandable && isClamped && !isExpanded && (
        <ExpandButton onExpand={() => setIsExpanded(true)} />
      )}
      <FullscreenImageViewer
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        images={allImages}
        initialIndex={viewerIndex}
        showThumbnails
      />
    </>
  );
}

export { PostCardBody, type PostCardBodyProps };
