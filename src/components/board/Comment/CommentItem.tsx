'use client';

import { useState } from 'react';
import { ChatIcon } from '@/assets/icons';
import { Avatar, AvatarFallback, AvatarImage, Button, Icon } from '@/components/ui';
import { useScrollIntoView } from '@/hooks';
import { cn } from '@/lib/cn';
import { ActionMenu } from '@/components/board/ActionMenu';
import { CommentDeleteDialog } from './CommentDeleteDialog';
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
  replyOpen?: boolean;
  onReplyToggle?: () => void;
  onReplyDirtyChange?: (dirty: boolean) => void;
  onReply?: (value: string) => Promise<boolean> | boolean;
  onEdit?: (content: string) => Promise<boolean> | boolean;
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
  replyOpen = false,
  onReplyToggle,
  onReplyDirtyChange,
  onReply,
  onEdit,
  onDelete,
}: CommentItemProps) {
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const replyInputRef = useScrollIntoView<HTMLDivElement>(replyOpen);

  const handleReplySubmit = async (value: string) => {
    const ok = await onReply?.(value);
    if (ok !== false) {
      onReplyDirtyChange?.(false);
      onReplyToggle?.();
    }
    return ok ?? true;
  };

  const handleEditSubmit = async (value: string) => {
    const ok = await onEdit?.(value);
    if (ok !== false) setEditing(false);
    return ok ?? true;
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
              placeholder="댓글을 수정하세요"
              onSubmit={handleEditSubmit}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <>
              <p className="typo-body1 text-text-normal whitespace-pre-wrap">{content}</p>
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
              onClick={onReplyToggle}
              aria-label="답글"
            >
              <Icon src={ChatIcon} size={13} className="text-icon-normal" />
            </Button>
            {isAuthor && (
              <ActionMenu
                triggerVariant="secondary"
                triggerClassName="size-6"
                onEdit={() => setEditing(true)}
                onDeleteSelect={() => setDeleteOpen(true)}
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

      <CommentDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => {
          onDelete?.();
          setDeleteOpen(false);
        }}
      />

      {replyOpen && (
        <div ref={replyInputRef}>
          <CommentInput
            className="mt-200 mr-450 ml-[38px]"
            placeholder="답글을 입력하세요"
            onSubmit={handleReplySubmit}
            onValueChange={(v) => onReplyDirtyChange?.(v.trim().length > 0)}
          />
        </div>
      )}
    </div>
  );
}

export { CommentItem, type CommentItemProps };
