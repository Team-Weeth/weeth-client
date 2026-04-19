'use client';

import { useRef } from 'react';
import { cn } from '@/lib/cn';
import { useLineClamp } from '@/hooks/useLineClamp';
import { useCodeHighlight } from '@/hooks/useCodeHighlight';

import { PostCardTitle } from './PostCardTitle';
import { ExpandButton } from './ExpandButton';

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
  const contentRef = useRef<HTMLDivElement>(null);
  const { ref, isClamped, isExpanded, setIsExpanded } = useLineClamp<HTMLDivElement>(
    expandable,
    content,
  );

  useCodeHighlight(contentRef, content);

  return (
    <div className={cn('flex flex-col gap-200 self-stretch', className)}>
      <PostCardTitle title={title} isNew={isNew} size="detail" />
      <div
        ref={(el) => {
          contentRef.current = el;
          if (expandable) ref.current = el;
        }}
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

export { PostCardDetailContent, type PostCardDetailContentProps };
