'use client';

import { cn } from '@/lib/cn';
import LikeIcon from '@/assets/icons/like.svg';
import LikeFilledIcon from '@/assets/icons/like_filled.svg';
import ChatIcon from '@/assets/icons/chat.svg';
import { Icon } from '@/components/ui/Icon';
import { useToggleLike } from '@/hooks/board/useToggleLike';

interface PostCardActionsProps {
  className?: string;
  postId: number;
  boardId: number;
  likeCount?: number;
  commentCount?: number;
  isLiked?: boolean;
  canComment?: boolean;
  onComment?: () => void;
}

function PostCardActions({
  className,
  postId,
  boardId,
  likeCount: initialLikeCount = 0,
  commentCount = 0,
  isLiked: initialIsLiked = false,
  canComment = true,
  onComment,
}: PostCardActionsProps) {
  const { isLiked, likeCount, toggleLike } = useToggleLike({
    postId,
    boardId,
    initialIsLiked,
    initialLikeCount,
  });

  return (
    <div className={cn('flex items-center gap-400 py-200', className)}>
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
      {canComment && (
        <button
          type="button"
          aria-label="댓글"
          className="focus-visible:outline-ring flex cursor-pointer items-center gap-100 rounded-sm hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={onComment}
        >
          <Icon src={ChatIcon} size={17} className="text-icon-alternative" />
          <span className="typo-caption2 text-text-alternative">{commentCount}</span>
        </button>
      )}
    </div>
  );
}

export { PostCardActions, type PostCardActionsProps };
