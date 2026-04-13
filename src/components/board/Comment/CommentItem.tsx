'use client';

import { useState } from 'react';
import { ChatIcon } from '@/assets/icons';
import { Avatar, AvatarFallback, AvatarImage, Button, Icon } from '@/components/ui';
import { useScrollIntoView } from '@/hooks';
import { cn } from '@/lib/cn';
import { ActionMenu } from '@/components/board/ActionMenu';
import { FileList } from '@/components/board/FileList';
import type { DisplayFile } from '@/types/board';
import type { UploadFileItem } from '@/stores/usePostStore';
import { CommentInput } from './CommentInput';
import { ReplyItem, type ReplyItemProps } from './ReplyItem';

interface CommentItemProps {
  className?: string;
  profileImage?: string;
  name: string;
  content: string;
  date: string;
  isAuthor?: boolean;
  files?: DisplayFile[];
  replies?: ReplyItemProps[];
  onReply?: (value: string, file: UploadFileItem | null) => void;
  onEdit?: (content: string, file: UploadFileItem | null, existingFilesRemoved: boolean) => void;
  onDelete?: () => void;
}

function CommentItem({
  className,
  profileImage,
  name,
  content,
  date,
  isAuthor,
  files,
  replies,
  onReply,
  onEdit,
  onDelete,
}: CommentItemProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const replyInputRef = useScrollIntoView<HTMLDivElement>(replyOpen);

  const handleReplySubmit = (value: string, file: UploadFileItem | null) => {
    onReply?.(value, file);
    setReplyOpen(false);
  };

  const handleEditSubmit = (
    value: string,
    file: UploadFileItem | null,
    existingFilesRemoved: boolean,
  ) => {
    onEdit?.(value, file, existingFilesRemoved);
    setEditing(false);
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
          {editing ? (
            <CommentInput
              className="mt-100"
              defaultValue={content}
              defaultFiles={files}
              placeholder="댓글을 수정하세요"
              onSubmit={handleEditSubmit}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <>
              <p className="typo-body1 text-text-normal whitespace-pre-wrap">{content}</p>
              {files && files.length > 0 && <FileList files={files} />}
              <p className="typo-caption2 text-text-alternative">{date}</p>
            </>
          )}
        </div>
        {!editing && (
          <div className="flex gap-100">
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              className="size-6"
              onClick={() => setReplyOpen((prev) => !prev)}
              aria-label="답글"
            >
              <Icon src={ChatIcon} size={13} className="text-icon-normal" />
            </Button>
            {isAuthor && (
              <ActionMenu
                triggerVariant="secondary"
                triggerClassName="size-6"
                onEdit={() => setEditing(true)}
                onDeleteSelect={onDelete}
              />
            )}
          </div>
        )}
      </div>

      {replies && replies.length > 0 && (
        <div className="flex flex-col gap-200">
          {replies.map((reply) => (
            <ReplyItem key={reply.id} {...reply} />
          ))}
        </div>
      )}

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
