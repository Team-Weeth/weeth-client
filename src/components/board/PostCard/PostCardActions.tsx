'use client';

import { cn } from '@/lib/cn';
import { LikeIcon, LikeFilledIcon, ChatIcon } from '@/assets/icons';
import { Icon } from '@/components/ui';
import { useToggleLike } from '@/hooks/board/useToggleLike';

interface PostCardActionsProps {
  className?: string;
  postId: number;
  likeCount?: number;
  commentCount?: number;
  isLiked?: boolean;
  onComment?: () => void;
}

function PostCardActions({
  className,
  postId,
  likeCount: initialLikeCount = 0,
  commentCount = 0,
  isLiked: initialIsLiked = false,
  onComment,
}: PostCardActionsProps) {
  const { isLiked, likeCount, toggleLike } = useToggleLike({
    postId,
    initialIsLiked,
    initialLikeCount,
  });

  return (
    <div className={cn('flex items-center gap-300', className)}>
      <button
        type="button"
        aria-label="좋아요"
        className="focus-visible:outline-ring flex cursor-pointer items-center gap-100 rounded-sm hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
        onClick={toggleLike}
      >
        <Icon
          src={isLiked ? LikeFilledIcon : LikeIcon}
          size={17}
          className={isLiked ? 'text-state-error' : 'text-icon-alternative'}
        />
        <span className="typo-caption2 text-text-alternative">{likeCount}</span>
      </button>
      <button
        type="button"
        aria-label="댓글"
        className="focus-visible:outline-ring flex cursor-pointer items-center gap-100 rounded-sm hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
        onClick={onComment}
      >
        <Icon src={ChatIcon} size={17} className="text-icon-alternative" />
        <span className="typo-caption2 text-text-alternative">{commentCount}</span>
      </button>
    </div>
  );
}

export { PostCardActions, type PostCardActionsProps };
