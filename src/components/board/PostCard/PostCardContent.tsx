'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { NewIcon } from '@/assets/icons';
import { cn } from '@/lib/cn';

interface PostCardContentProps {
  className?: string;
  title: string;
  content: string;
  isNew?: boolean;
  expandable?: boolean;
  variant?: 'list' | 'detail';
}

function PostCardContent({
  className,
  title,
  content,
  isNew,
  expandable = true,
  variant = 'list',
}: PostCardContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isClamped, setIsClamped] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const el = contentRef.current;
    if (!el || !expandable) return;

    const check = () => {
      const prevDisplay = el.style.display;
      const prevClamp = el.style.webkitLineClamp;
      el.style.display = 'block';
      el.style.webkitLineClamp = 'unset';
      const fullHeight = el.scrollHeight;
      el.style.display = prevDisplay;
      el.style.webkitLineClamp = prevClamp;
      setIsClamped(fullHeight > el.clientHeight);
    };

    check();

    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [content, expandable]);

  const plainContent =
    variant === 'list'
      ? content
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/(p|h[1-6]|li|div|blockquote)>/gi, '\n')
          .replace(/<[^>]*>/g, '')
          .replace(/\n{3,}/g, '\n\n')
          .trim()
      : content;

  return (
    <div className={cn('flex flex-col gap-200 self-stretch', className)}>
      <div className="flex items-center gap-[5px]">
        <h3 className={cn('text-text-strong', variant === 'detail' ? 'typo-h3' : 'typo-sub2')}>
          {title}
        </h3>
        {isNew && (
          <>
            <Image src={NewIcon} alt="" width={7} height={9} aria-hidden />
            <span className="sr-only">새 글</span>
          </>
        )}
      </div>
      {variant === 'list' ? (
        <p
          ref={expandable ? contentRef : undefined}
          className={cn(
            'text-text-normal typo-body2 whitespace-pre-line',
            expandable && !isExpanded && 'line-clamp-8 overflow-hidden',
          )}
        >
          {plainContent}
        </p>
      ) : (
        <div
          ref={expandable ? contentRef : undefined}
          className={cn(
            'ProseMirror prose-readonly text-text-normal typo-body1 whitespace-pre-line',
            expandable && !isExpanded && 'line-clamp-8 overflow-hidden',
          )}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
      {expandable && isClamped && !isExpanded && (
        <button
          type="button"
          className="typo-body2 text-text-alternative hover:text-text-normal focus-visible:outline-ring cursor-pointer self-start rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsExpanded(true);
          }}
        >
          이어서 보기
        </button>
      )}
    </div>
  );
}

export { PostCardContent, type PostCardContentProps };
