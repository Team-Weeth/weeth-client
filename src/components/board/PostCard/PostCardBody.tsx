'use client';

import { useRef } from 'react';
import DOMPurify from 'dompurify';
import { cn } from '@/lib/cn';
import { useLineClamp } from '@/hooks/useLineClamp';
import { useCodeHighlight } from '@/hooks/useCodeHighlight';

import { ExpandButton } from './ExpandButton';

interface PostCardBodyProps {
  className?: string;
  content: string;
  expandable?: boolean;
}

function PostCardBody({ className, content, expandable = false }: PostCardBodyProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const sanitized = DOMPurify.sanitize(content);
  const { ref, isClamped, isExpanded, setIsExpanded } = useLineClamp<HTMLDivElement>(
    expandable,
    sanitized,
  );

  useCodeHighlight(contentRef, sanitized);

  return (
    <>
      <div
        ref={(el) => {
          contentRef.current = el;
          if (expandable) ref.current = el;
        }}
        className={cn(
          'ProseMirror prose-readonly text-text-normal typo-body1 self-stretch whitespace-pre-line',
          expandable && !isExpanded && 'line-clamp-8 overflow-hidden',
          className,
        )}
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
      {expandable && isClamped && !isExpanded && (
        <ExpandButton onExpand={() => setIsExpanded(true)} />
      )}
    </>
  );
}

export { PostCardBody, type PostCardBodyProps };
