'use client';

import { useState } from 'react';
import { ReplyIcon } from '@/assets/icons';
import { Avatar, AvatarFallback, AvatarImage, Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import { ActionMenu } from '@/components/board/ActionMenu';
import { CommentDeleteDialog } from './CommentDeleteDialog';
import { CommentInput } from './CommentInput';

interface ReplyItemProps {
  id: number | string;
  className?: string;
  profileImage?: string;
  name: string;
  content: string;
  date: string;
  isAuthor?: boolean;
  onEdit?: (content: string) => void;
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
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleEditSubmit = async (value: string) => {
    await onEdit?.(value);
    setEditing(false);
    return true;
  };

  return (
    <div className={cn('flex items-start justify-between gap-100 self-stretch px-450', className)}>
      <Icon src={ReplyIcon} size={20} className="text-icon-alternative" />
      <div className="bg-container-neutral-alternative relative flex-1 rounded-lg p-400">
        <div className="flex flex-col gap-200">
          <div className="flex items-center gap-[5px]">
            <Avatar size={24}>
              <AvatarImage src={profileImage ?? undefined} alt={name} />
              <AvatarFallback />
            </Avatar>
            <span className="typo-sub3 text-text-strong">{name}</span>
          </div>
          {editing ? (
            <CommentInput
              defaultValue={content}
              placeholder="답글을 수정하세요"
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
        {isAuthor && !editing && (
          <ActionMenu
            triggerVariant="secondary"
            triggerClassName="absolute top-400 right-400 size-6"
            onEdit={() => setEditing(true)}
            onDeleteSelect={() => setDeleteOpen(true)}
          />
        )}
      </div>

      <CommentDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => {
          onDelete?.();
          setDeleteOpen(false);
        }}
      />
    </div>
  );
}

export { ReplyItem, type ReplyItemProps };
