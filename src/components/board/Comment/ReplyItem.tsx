'use client';

import { useState } from 'react';
import ReplyIcon from '@/assets/icons/reply.svg';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/Icon';
import { useCommentEditForm } from '@/hooks/board/useCommentEditForm';
import { cn } from '@/lib/cn';
import { ActionMenu } from '@/components/board/ActionMenu';
import { FileList } from '@/components/board/FileList';
import { ImageList } from '@/components/board/ImageList/ImageList';
import { LinkifiedText } from '@/components/board/LinkifiedText';
import { useActiveEditId, useCommentEditActions } from '@/stores/useCommentEditStore';
import type { DisplayFile } from '@/types/board';
import type { CreatePostFile } from '@/types/file';
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
  imageFileUrls?: DisplayFile[];
  nonImageFileUrls?: DisplayFile[];
  /** 답글 입력창이 열려있지 않을 때 true — 수정 시작 가능 여부 */
  canEdit?: boolean;
  onEdit?: (content: string, files: CreatePostFile[] | null) => Promise<boolean> | boolean;
  onDelete?: () => void;
}

function ReplyItem({
  id,
  className,
  profileImage,
  name,
  content,
  date,
  isAuthor,
  imageFileUrls,
  nonImageFileUrls,
  canEdit = true,
  onEdit,
  onDelete,
}: ReplyItemProps) {
  const activeEditId = useActiveEditId();
  const { startEdit, cancelEdit } = useCommentEditActions();
  const isEditing = activeEditId === id;

  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    editingImageFiles,
    editingNonImageFiles,
    handleRemoveExistingFile,
    resetRemovedIds,
    buildFilesToSend,
  } = useCommentEditForm(imageFileUrls, nonImageFileUrls);

  const startEditing = () => {
    if (!canEdit || activeEditId !== null) return;
    resetRemovedIds();
    startEdit(id);
  };

  const cancelEditing = () => {
    resetRemovedIds();
    cancelEdit();
  };

  const handleEditSubmit = async (value: string, newFiles: CreatePostFile[]) => {
    const filesToSend = buildFilesToSend(newFiles);
    const ok = await onEdit?.(value, filesToSend);
    if (ok !== false) {
      resetRemovedIds();
      cancelEdit();
    }
    return ok ?? true;
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
          {isEditing ? (
            <CommentInput
              defaultValue={content}
              placeholder="답글을 수정하세요"
              onSubmit={handleEditSubmit}
              onCancel={cancelEditing}
              existingImageFiles={editingImageFiles}
              existingNonImageFiles={editingNonImageFiles}
              onRemoveExistingFile={handleRemoveExistingFile}
            />
          ) : (
            <>
              <LinkifiedText
                text={content}
                className="typo-body1 text-text-normal whitespace-pre-wrap"
              />
              {imageFileUrls && imageFileUrls.length > 0 && <ImageList files={imageFileUrls} />}
              {nonImageFileUrls && nonImageFileUrls.length > 0 && (
                <FileList files={nonImageFileUrls} />
              )}
              <p className="typo-caption2 text-text-alternative">{date}</p>
            </>
          )}
        </div>
        {isAuthor && !isEditing && (
          <ActionMenu
            triggerVariant="secondary"
            triggerClassName="absolute top-400 right-400 size-6"
            onEdit={startEditing}
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
