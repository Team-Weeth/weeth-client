'use client';

import { cn } from '@/lib/cn';
import { stripHtml } from '@/lib/stripHtml';
import { useLineClamp } from '@/hooks/useLineClamp';

import { PostCardTitle } from './PostCardTitle';
import { ExpandButton } from './ExpandButton';

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
    content,
  );

  const plainContent = stripHtml(content);

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

export { PostCardListContent, type PostCardListContentProps };
