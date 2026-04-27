import { cn } from '@/lib/cn';

import { PostCardTitle } from './PostCardTitle';
import { PostCardBody } from './PostCardBody';

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
  return (
    <div className={cn('flex flex-col gap-400 self-stretch', className)}>
      <PostCardTitle title={title} isNew={isNew} size="detail" />
      <PostCardBody content={content} expandable={expandable} />
    </div>
  );
}

export { PostCardDetailContent, type PostCardDetailContentProps };
