'use client';

import { useState } from 'react';
import type { StaticImageData } from 'next/image';
import { ChatIcon } from '@/assets/icons';
import { Avatar, AvatarFallback, AvatarImage, Button } from '@/components/ui';
import { useScrollIntoView } from '@/hooks';
import { cn } from '@/lib/cn';
import { PostActionMenu } from '@/components/board/PostActionMenu';
import type { FileItem } from '@/stores/usePostStore';
import { CommentInput } from './CommentInput';
import { ReplyItem, type ReplyItemProps } from './ReplyItem';

interface CommentItemProps {
  className?: string;
  profileImage?: string;
  name: string;
  content: string;
  date: string;
  isAuthor?: boolean;
  replies?: ReplyItemProps[];
  onReply?: (value: string, file: FileItem | null) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function CommentItem({
  className,
  profileImage,
  name,
  content,
  date,
  isAuthor,
  replies,
  onReply,
  onEdit,
  onDelete,
}: CommentItemProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const replyInputRef = useScrollIntoView<HTMLDivElement>(replyOpen);

  const handleReplySubmit = (value: string, file: FileItem | null) => {
    onReply?.(value, file);
    setReplyOpen(false);
  };

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-start gap-[7px] self-stretch px-450 py-400">
        <div className="flex flex-1 flex-col gap-200">
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
        <div className="flex gap-100">
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            className="size-6"
            onClick={() => setReplyOpen((prev) => !prev)}
            aria-label="답글"
          >
            <span
              aria-hidden
              className="bg-icon-normal block h-[13px] w-[13px] mask-contain mask-center mask-no-repeat"
              style={{
                maskImage: `url(${(ChatIcon as StaticImageData).src})`,
                WebkitMaskImage: `url(${(ChatIcon as StaticImageData).src})`,
              }}
            />
          </Button>
          {isAuthor && (
            <PostActionMenu
              triggerVariant="secondary"
              triggerClassName="size-6"
              onEdit={onEdit}
              onDelete={onDelete}
            />
          )}
        </div>
      </div>

      {replies?.map((reply) => (
        <ReplyItem key={reply.id} {...reply} />
      ))}

      {replyOpen && (
        <div ref={replyInputRef}>
          <CommentInput
            className="mt-200 mr-450 ml-[38px]"
            placeholder="답글을 입력하세요"
            onSubmit={handleReplySubmit}
          />
        </div>
      )}
    </div>
  );
}

export { CommentItem, type CommentItemProps };
