'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { StaticImageData } from 'next/image';
import { ChatIcon, MoreVerticalIcon } from '@/assets/icons';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import { cn } from '@/lib/cn';
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
  onReply?: (value: string) => void;
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

  const handleReplySubmit = (value: string) => {
    onReply?.(value);
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
            <Image src={ChatIcon} alt="" width={13} height={13} className="text-icon-normal" />
          </Button>
          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  className="size-6"
                  aria-label="더보기"
                >
                  <span
                    aria-hidden
                    className="bg-icon-normal block h-4 w-1 mask-contain mask-center mask-no-repeat"
                    style={{
                      maskImage: `url(${(MoreVerticalIcon as StaticImageData).src})`,
                      WebkitMaskImage: `url(${(MoreVerticalIcon as StaticImageData).src})`,
                    }}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[144px]">
                <DropdownMenuItem onSelect={onEdit}>수정</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem destructive onSelect={onDelete}>
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {replies?.map((reply, index) => (
        <ReplyItem key={index} {...reply} />
      ))}

      {replyOpen && (
        <CommentInput
          className="mt-200 ml-[38px] mr-450"
          placeholder="답글을 입력하세요"
          onSubmit={handleReplySubmit}
        />
      )}
    </div>
  );
}

export { CommentItem, type CommentItemProps };
