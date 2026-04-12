'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { boardApi } from '@/lib/apis/board';
import { useClubId } from '@/stores/useClubStore';
import { LikeIcon, LikeFilledIcon, ChatIcon } from '@/assets/icons';
import { Icon } from '@/components/ui';

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
  const clubId = useClubId();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  const handleLike = async () => {
    if (!clubId) return;

    const prevIsLiked = isLiked;
    const prevLikeCount = likeCount;

    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
      const res = await boardApi.toggleLike(clubId, postId);
      const { isLiked: serverIsLiked, likeCount: serverLikeCount } = res.data.data;
      setIsLiked(serverIsLiked);
      setLikeCount(serverLikeCount);
    } catch {
      setIsLiked(prevIsLiked);
      setLikeCount(prevLikeCount);
    }
  };

  return (
    <div className={cn('flex items-center gap-300', className)}>
      <button
        type="button"
        aria-label="좋아요"
        className="focus-visible:outline-ring flex cursor-pointer items-center gap-100 rounded-sm hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
        onClick={handleLike}
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
