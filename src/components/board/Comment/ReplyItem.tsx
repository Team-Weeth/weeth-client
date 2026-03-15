'use client';

import type { StaticImageData } from 'next/image';
import { ReplyIcon } from '@/assets/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { cn } from '@/lib/cn';
import { PostActionMenu } from '@/components/board/PostActionMenu';

interface ReplyItemProps {
  id: number | string;
  className?: string;
  profileImage?: string;
  name: string;
  content: string;
  date: string;
  isAuthor?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

function ReplyItem({
  className,
  profileImage,
  name,
  content,
  date,
  isAuthor,
  onEdit,
  onDelete,
}: ReplyItemProps) {
  return (
    <div className={cn('flex items-start justify-between self-stretch px-450', className)}>
      <span
        aria-hidden
        className="bg-icon-alternative block size-5 shrink-0 mask-contain mask-center mask-no-repeat"
        style={{
          maskImage: `url(${(ReplyIcon as StaticImageData).src})`,
          WebkitMaskImage: `url(${(ReplyIcon as StaticImageData).src})`,
        }}
      />
      <div className="bg-container-neutral-alternative relative flex-1 rounded-lg p-400">
        <div className="flex flex-col gap-200">
          <div className="flex items-center gap-[5px]">
            <Avatar size={24}>
              {profileImage && <AvatarImage src={profileImage} alt={name} />}
              <AvatarFallback>{name[0]}</AvatarFallback>
            </Avatar>
            <span className="typo-sub2 text-text-strong">{name}</span>
          </div>
          <p className="typo-body1 text-text-normal">{content}</p>
          <p className="typo-caption2 text-text-alternative">{date}</p>
        </div>
        {isAuthor && (
          <PostActionMenu
            triggerVariant="secondary"
            triggerClassName="absolute top-400 right-400 size-6"
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
      </div>
    </div>
  );
}

export { ReplyItem, type ReplyItemProps };
