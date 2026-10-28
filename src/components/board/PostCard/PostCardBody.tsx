'use client';

import { useState, useMemo } from 'react';
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

/**
 * sanitized HTML에서 img[src] 목록을 DOM 순서대로 추출한다.
 * collectDocImages(editor.state.doc) 를 HTML 파싱으로 대체해 Tiptap 의존성을 제거.
 * SSR 환경에서는 document 가 없으므로 빈 배열을 반환한다.
 */
function extractImages(html: string): FullscreenImageViewerImage[] {
  if (typeof window === 'undefined') return [];
  const container = document.createElement('div');
  container.innerHTML = html;
  return Array.from(container.querySelectorAll<HTMLImageElement>('img[src]')).map((img) => ({
    url: img.getAttribute('src')!,
    alt: img.getAttribute('alt') ?? undefined,
  }));
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

  const allImages = useMemo(() => extractImages(sanitized), [sanitized]);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const img = (e.target as HTMLElement).closest<HTMLImageElement>('img[src]');
    if (!img) return;
    const src = img.getAttribute('src');
    if (!src) return;
    const index = allImages.findIndex((i) => i.url === src);
    if (index === -1) return;
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
            'ProseMirror prose-readonly text-text-normal typo-body1 self-stretch whitespace-pre-line w-full max-w-[900px]',
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
