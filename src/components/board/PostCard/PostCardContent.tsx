'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { NewIcon } from '@/assets/icons';
import { cn } from '@/lib/cn';

interface PostCardTitleProps {
  title: string;
  isNew?: boolean;
  size: 'list' | 'detail';
}

function PostCardTitle({ title, isNew, size }: PostCardTitleProps) {
  return (
    <div className="flex items-center gap-[5px]">
      <h3 className={cn('text-text-strong', size === 'detail' ? 'typo-h3' : 'typo-sub2')}>
        {title}
      </h3>
      {isNew && (
        <>
          <Image src={NewIcon} alt="" width={7} height={9} aria-hidden />
          <span className="sr-only">새 글</span>
        </>
      )}
    </div>
  );
}

function useLineClamp<T extends HTMLElement>(enabled: boolean, deps: unknown[]) {
  const ref = useRef<T>(null);
  const [isClamped, setIsClamped] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

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
  }, [enabled, ...deps]);

  return { ref, isClamped, isExpanded, setIsExpanded };
}

interface ExpandButtonProps {
  onExpand: () => void;
}

function ExpandButton({ onExpand }: ExpandButtonProps) {
  return (
    <button
      type="button"
      className="typo-body2 text-text-alternative hover:text-text-normal focus-visible:outline-ring cursor-pointer self-start rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onExpand();
      }}
    >
      이어서 보기
    </button>
  );
}

interface PostCardListContentProps {
  className?: string;
  title: string;
  content: string;
  isNew?: boolean;
  expandable?: boolean;
}

function PostCardListContent({
  className,
  title,
  content,
  isNew,
  expandable = true,
}: PostCardListContentProps) {
  const { ref, isClamped, isExpanded, setIsExpanded } = useLineClamp<HTMLParagraphElement>(
    expandable,
    [content],
  );

  const plainContent = content
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|h[1-6]|li|div|blockquote)>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return (
    <div className={cn('flex flex-col gap-200 self-stretch', className)}>
      <PostCardTitle title={title} isNew={isNew} size="list" />
      <p
        ref={expandable ? ref : undefined}
        className={cn(
          'text-text-normal typo-body2 whitespace-pre-line',
          expandable && !isExpanded && 'line-clamp-8 overflow-hidden',
        )}
      >
        {plainContent}
      </p>
      {expandable && isClamped && !isExpanded && (
        <ExpandButton onExpand={() => setIsExpanded(true)} />
      )}
    </div>
  );
}

interface PostCardDetailContentProps {
  className?: string;
  title: string;
  content: string;
  isNew?: boolean;
  expandable?: boolean;
}

function PostCardDetailContent({
  className,
  title,
  content,
  isNew,
  expandable = false,
}: PostCardDetailContentProps) {
  const { ref, isClamped, isExpanded, setIsExpanded } = useLineClamp<HTMLDivElement>(expandable, [
    content,
  ]);

  return (
    <div className={cn('flex flex-col gap-200 self-stretch', className)}>
      <PostCardTitle title={title} isNew={isNew} size="detail" />
      <div
        ref={expandable ? ref : undefined}
        className={cn(
          'ProseMirror prose-readonly text-text-normal typo-body1 whitespace-pre-line',
          expandable && !isExpanded && 'line-clamp-8 overflow-hidden',
        )}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      {expandable && isClamped && !isExpanded && (
        <ExpandButton onExpand={() => setIsExpanded(true)} />
      )}
    </div>
  );
}

export {
  PostCardListContent,
  PostCardDetailContent,
  type PostCardListContentProps,
  type PostCardDetailContentProps,
};
