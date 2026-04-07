'use client';

import { cn } from '@/lib/cn';
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
  const { ref, isClamped, isExpanded, setIsExpanded } = useLineClamp<HTMLDivElement>(
    expandable,
    content,
  );

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
