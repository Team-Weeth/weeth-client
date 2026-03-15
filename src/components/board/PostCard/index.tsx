import { cn } from '@/lib/cn';
import { ImageList } from '@/components/board/ImageList';
import type { FileItem } from '@/stores/usePostStore';
import { PostAuthorInfo } from './PostAuthorInfo';
import { PostCardContent } from './PostCardContent';
import { PostCardActions, type PostCardActionsProps } from './PostCardActions';

function PostCardRoot({ className, children, ...props }: React.ComponentProps<'article'>) {
  return (
    <article
      className={cn(
        'bg-container-neutral flex flex-col items-start gap-400 self-stretch overflow-x-hidden rounded-(--radius-lg) px-450 py-400',
        className,
      )}
      {...props}
    >
      {children}
    </article>
  );
}

function PostCardHeader({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex items-center justify-between self-stretch', className)} {...props}>
      {children}
    </div>
  );
}

interface PostCardImagesProps {
  className?: string;
  files: FileItem[];
}

function PostCardImages({ className, files }: PostCardImagesProps) {
  if (files.length === 0) return null;
  return (
    <div className={className}>
      <ImageList files={files} />
    </div>
  );
}

const PostCard = {
  Root: PostCardRoot,
  Header: PostCardHeader,
  Author: PostAuthorInfo,
  Content: PostCardContent,
  Images: PostCardImages,
  Actions: PostCardActions,
};

export { PostCard, type PostCardActionsProps, type PostCardImagesProps };
