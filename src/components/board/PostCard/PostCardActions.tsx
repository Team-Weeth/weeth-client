'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { StaticImageData } from 'next/image';
import { cn } from '@/lib/cn';
import { LikeIcon, LikeFilledIcon, ChatIcon } from '@/assets/icons';

interface PostCardActionsProps {
  className?: string;
  likeCount?: number;
  commentCount?: number;
  isLiked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
}

function PostCardActions({
  className,
  likeCount = 0,
  commentCount = 0,
  isLiked: initialIsLiked = false,
  onLike,
  onComment,
}: PostCardActionsProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);

  const handleLike = () => {
    const next = !isLiked;
    setIsLiked(next);
    // TODO: API 연동 시 제거
    console.log(next ? '좋아요' : '좋아요 취소');
    onLike?.();
  };

  return (
    <div className={cn('flex items-center gap-300', className)}>
      <button
        type="button"
        aria-label="좋아요"
        className="focus-visible:outline-ring flex cursor-pointer items-center gap-100 rounded-sm hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
        onClick={handleLike}
      >
        <span
          aria-hidden
          className={cn(
            'block h-[15px] w-[17px] mask-contain mask-no-repeat',
            isLiked ? 'bg-state-error' : 'bg-icon-alternative',
          )}
          style={{
            maskImage: `url(${(isLiked ? (LikeFilledIcon as StaticImageData) : (LikeIcon as StaticImageData)).src})`,
            WebkitMaskImage: `url(${(isLiked ? (LikeFilledIcon as StaticImageData) : (LikeIcon as StaticImageData)).src})`,
          }}
        />
        <span className="typo-caption2 text-text-alternative">{likeCount}</span>
      </button>
      <button
        type="button"
        aria-label="댓글"
        className="focus-visible:outline-ring flex cursor-pointer items-center gap-100 rounded-sm hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
        onClick={onComment}
      >
        <span
          aria-hidden
          className="bg-icon-alternative block size-[17px] mask-contain mask-no-repeat"
          style={{
            maskImage: `url(${(ChatIcon as StaticImageData).src})`,
            WebkitMaskImage: `url(${(ChatIcon as StaticImageData).src})`,
          }}
        />
        <span className="typo-caption2 text-text-alternative">{commentCount}</span>
      </button>
    </div>
  );
}

export { PostCardActions, type PostCardActionsProps };
