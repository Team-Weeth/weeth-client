'use client';

import { useState } from 'react';
import ChatIcon from '@/assets/icons/chat.svg';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useScrollIntoView } from '@/hooks/useScrollIntoView';
import { cn } from '@/lib/cn';
import { ActionMenu } from '@/components/board/ActionMenu';
import { FileList } from '@/components/board/FileList';
import { ImageList } from '@/components/board/ImageList/ImageList';
import { useActiveEditId, useCommentEditActions } from '@/stores/useCommentEditStore';
import { toCreatePostFile } from '@/lib/board';
import type { DisplayFile } from '@/types/board';
import type { CreatePostFile } from '@/types/file';
import { CommentDeleteDialog } from './CommentDeleteDialog';
import { CommentInput } from './CommentInput';
import { ReplyItem, type ReplyItemProps } from './ReplyItem';

interface CommentItemProps {
  id: number | string;
  className?: string;
  profileImage?: string;
  name: string;
  content: string;
  date: string;
  isAuthor?: boolean;
  isDeleted?: boolean;
  imageFileUrls?: DisplayFile[];
  nonImageFileUrls?: DisplayFile[];
  replies?: ReplyItemProps[];
  replyOpen?: boolean;
  /** 답글 입력창이 열려있지 않을 때 true — 수정 시작 가능 여부 */
  canEdit?: boolean;
  onReplyToggle?: () => void;
  onReplySuccess?: () => void;
  onReplyDirtyChange?: (dirty: boolean) => void;
  onReply?: (value: string, files: CreatePostFile[]) => Promise<boolean> | boolean;
  onEdit?: (content: string, files: CreatePostFile[] | null) => Promise<boolean> | boolean;
  onDelete?: () => void;
}

function CommentItem({
  id,
  className,
  profileImage,
  name,
  content,
  date,
  isAuthor,
  isDeleted,
  imageFileUrls,
  nonImageFileUrls,
  replies,
  replyOpen = false,
  canEdit = true,
  onReplyToggle,
  onReplySuccess,
  onReplyDirtyChange,
  onReply,
  onEdit,
  onDelete,
}: CommentItemProps) {
  const activeEditId = useActiveEditId();
  const { startEdit, cancelEdit } = useCommentEditActions();
  const isEditing = activeEditId === id;

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [removedExistingIds, setRemovedExistingIds] = useState<Set<string | number>>(new Set());
  const replyInputRef = useScrollIntoView<HTMLDivElement>(replyOpen);

  const startEditing = () => {
    if (!canEdit || activeEditId !== null) return;
    setRemovedExistingIds(new Set());
    startEdit(id);
  };

  const cancelEditing = () => {
    setRemovedExistingIds(new Set());
    cancelEdit();
  };

  const handleRemoveExistingFile = (fileId: string | number) => {
    setRemovedExistingIds((prev) => new Set([...prev, fileId]));
  };

  const editingImageFiles = (imageFileUrls ?? []).filter((f) => !removedExistingIds.has(f.id));
  const editingNonImageFiles = (nonImageFileUrls ?? []).filter(
    (f) => !removedExistingIds.has(f.id),
  );

  const handleReplySubmit = async (value: string, files: CreatePostFile[]) => {
    const ok = await onReply?.(value, files);
    if (ok !== false) {
      onReplyDirtyChange?.(false);
      onReplySuccess?.();
    }
    return ok ?? true;
  };

  const handleEditSubmit = async (value: string, newFiles: CreatePostFile[]) => {
    const hasChanges = removedExistingIds.size > 0 || newFiles.length > 0;

    let filesToSend: CreatePostFile[] | null = null;
    if (hasChanges) {
      const remainingExisting = [...editingImageFiles, ...editingNonImageFiles]
        .map(toCreatePostFile)
        .filter((f): f is CreatePostFile => f !== null);
      filesToSend = [...remainingExisting, ...newFiles];
    }

    const ok = await onEdit?.(value, filesToSend);
    if (ok !== false) {
      setRemovedExistingIds(new Set());
      cancelEdit();
    }
    return ok ?? true;
  };

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-start gap-[7px] self-stretch px-450 py-400">
        <div className="flex flex-1 flex-col gap-200">
          <div className="flex items-center gap-[5px]">
            <Avatar size={24}>
              <AvatarImage src={profileImage ?? undefined} alt={name} />
              <AvatarFallback />
            </Avatar>
            <span className="typo-sub3 text-text-strong">{name}</span>
          </div>
          {isEditing ? (
            <CommentInput
              className="mt-100"
              defaultValue={content}
              placeholder="댓글을 수정하세요"
              onSubmit={handleEditSubmit}
              onCancel={cancelEditing}
              existingImageFiles={editingImageFiles}
              existingNonImageFiles={editingNonImageFiles}
              onRemoveExistingFile={handleRemoveExistingFile}
            />
          ) : (
            <>
              <p
                className={cn(
                  'typo-body1 whitespace-pre-wrap',
                  isDeleted ? 'text-text-disabled' : 'text-text-normal',
                )}
              >
                {content}
              </p>
              {imageFileUrls && imageFileUrls.length > 0 && <ImageList files={imageFileUrls} />}
              {nonImageFileUrls && nonImageFileUrls.length > 0 && (
                <FileList files={nonImageFileUrls} />
              )}
              <p className="typo-caption2 text-text-alternative">{date}</p>
            </>
          )}
        </div>
        {!isEditing && (
          <div className="flex gap-100">
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              className="size-6"
              onClick={onReplyToggle}
              aria-label="답글"
            >
              <Icon src={ChatIcon} size={16} className="text-icon-normal" />
            </Button>
            {isAuthor && !isDeleted && (
              <ActionMenu
                triggerVariant="secondary"
                triggerClassName="size-6"
                onEdit={startEditing}
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
        <div ref={replyInputRef} className="mt-200 mr-450 ml-[38px]">
          <CommentInput
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
