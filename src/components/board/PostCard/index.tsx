'use client';

import Image from 'next/image';
import type { StaticImageData } from 'next/image';
import { cn } from '@/lib/cn';
import { ImageList } from '@/components/board/ImageList';
import type { FileItem } from '@/stores/usePostStore';
import { LikeIcon, ChatIcon } from '@/assets/icons';
import { PostAuthorInfo } from './PostAuthorInfo';
import { PostCardContent } from './PostCardContent';

interface PostCardProps extends React.ComponentProps<'article'> {
  author: {
    name: string;
    profileImageUrl?: string;
  };
  date: string;
  dateTime?: string;
  title: string;
  content: string;
  isNew?: boolean;
  hasAttachment?: boolean;
  images?: FileItem[];
  likeCount?: number;
  commentCount?: number;
  isLiked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  showReadMore?: boolean;
  onReadMore?: () => void;
}

function PostCard({
  className,
  author,
  date,
  dateTime,
  title,
  content,
  isNew,
  hasAttachment,
  images = [],
  likeCount = 0,
  commentCount = 0,
  isLiked = false,
  showReadMore = false,
  onLike,
  onComment,
  onReadMore,
  ...props
}: PostCardProps) {
  return (
    <article
      className={cn(
        'bg-container-neutral flex flex-col items-start gap-400 self-stretch overflow-hidden rounded-(--radius-lg) px-450 py-400',
        className,
      )}
      {...props}
    >
      <PostAuthorInfo
        author={author}
        date={date}
        dateTime={dateTime}
        hasAttachment={hasAttachment}
      />

      <PostCardContent
        title={title}
        content={content}
        isNew={isNew}
        showReadMore={showReadMore}
        onReadMore={onReadMore}
      />

      {/* Images */}
      <ImageList files={images} />

      {/* Footer */}
      <div className="flex items-center gap-300">
        <button
          type="button"
          aria-label="좋아요"
          className="flex cursor-pointer items-center gap-100"
          onClick={onLike}
        >
          <span
            aria-hidden
            className={cn(
              'block h-[15px] w-[17px]',
              isLiked ? 'bg-state-error' : 'bg-icon-alternative',
            )}
            style={{
              maskImage: `url(${(LikeIcon as StaticImageData).src})`,
              WebkitMaskImage: `url(${(LikeIcon as StaticImageData).src})`,
              maskRepeat: 'no-repeat',
              maskSize: 'contain',
            }}
          />
          <span className="typo-caption2 text-text-alternative">{likeCount}</span>
        </button>
        <button
          type="button"
          aria-label="댓글"
          className="flex cursor-pointer items-center gap-100"
          onClick={onComment}
        >
          <Image src={ChatIcon as StaticImageData} alt="" width={17} height={17} aria-hidden />
          <span className="typo-caption2 text-text-alternative">{commentCount}</span>
        </button>
      </div>
    </article>
  );
}

export { PostCard, type PostCardProps };
