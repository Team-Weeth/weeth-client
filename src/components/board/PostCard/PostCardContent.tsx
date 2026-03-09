'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

interface PostCardContentProps {
  title: string;
  content: string;
  isNew?: boolean;
}

function PostCardContent({ title, content, isNew }: PostCardContentProps) {
  const contentRef = useRef<HTMLParagraphElement>(null);
  const [isClamped, setIsClamped] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const el = contentRef.current;
    if (!el || isExpanded) return;

    const check = () => {
      el.style.webkitLineClamp = 'unset';
      const fullHeight = el.scrollHeight;
      el.style.webkitLineClamp = '';
      setIsClamped(fullHeight > el.clientHeight);
    };

    check();

    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [content, isExpanded]);

  return (
    <div className="flex flex-col gap-200 self-stretch">
      <div className="flex items-center gap-[5px]">
        <h3 className="typo-sub2 text-text-strong">{title}</h3>
        {isNew && (
          <>
            <span className="typo-caption1 text-state-error" aria-hidden>
              N
            </span>
            <span className="sr-only">새 글</span>
          </>
        )}
      </div>
      <p
        ref={contentRef}
        className={cn(
          'typo-body2 text-text-normal whitespace-pre-line',
          !isExpanded && 'line-clamp-8',
        )}
      >
        {content}
      </p>
      {isClamped && !isExpanded && (
        <button
          type="button"
          className="typo-body2 text-text-alternative hover:text-text-normal focus-visible:outline-ring cursor-pointer self-start rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={() => setIsExpanded(true)}
        >
          이어서 보기
        </button>
      )}
    </div>
  );
}

export { PostCardContent, type PostCardContentProps };
