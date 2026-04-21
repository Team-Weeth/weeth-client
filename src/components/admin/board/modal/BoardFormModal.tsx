'use client';

import { useState } from 'react';

import { Button, Switch } from '@/components/ui';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { DiscardConfirmDialog, type DiscardMessages } from '@/components/admin/modal/DiscardConfirmDialog';
import { CustomAlertDialog } from '@/components/alert';
import { DeleteBoardDialog } from '@/components/admin/board/modal/DeleteBoardDialog';
import { ModalIconButton } from '@/components/admin/modal/ModalIconButton';
import { AdminCloseIcon, AdminMeatballIcon } from '@/assets/icons/admin';
import { cn } from '@/lib/cn';
import { useDiscardableForm } from '@/hooks/useDiscardableForm';
import type { BoardVisibility } from '@/types/admin/board';

const DESCRIPTION_MAX = 30;

const VISIBILITY_OPTIONS: { value: BoardVisibility; label: string }[] = [
  { value: 'PUBLIC', label: '전체 공개' },
  { value: 'ADMIN_ONLY', label: '관리자 전용' },
  { value: 'PRIVATE', label: '비공개' },
];

interface BoardFormData {
  name: string;
  description: string;
  visibility: BoardVisibility;
  commentEnabled: boolean;
}

const DEFAULT_FORM: BoardFormData = {
  name: '',
  description: '',
  visibility: 'PUBLIC',
  commentEnabled: true,
};

type BoardFormMode = 'create' | 'edit';

const DISCARD_MESSAGES: Record<BoardFormMode, DiscardMessages> = {
  create: {
    title: '작성하던 내용이 있어요.\n내용을 폐기하고 나갈까요?',
    actionLabel: '나가기',
    cancelLabel: '보관하기',
  },
  edit: {
    title: '변경사항이 있어요.\n변경사항을 폐기할까요?',
    actionLabel: '변경사항 폐기',
  },
};

interface BoardFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  mode?: BoardFormMode;
  initialValues?: Partial<BoardFormData>;
  onSubmit?: (data: BoardFormData) => void;
  onDelete?: () => void;
}

function BoardFormModal({
  open,
  onOpenChange,
  title,
  mode = 'edit',
  initialValues,
  onSubmit,
  onDelete,
}: BoardFormModalProps) {
  const discardMessages = DISCARD_MESSAGES[mode];
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteDiscardOpen, setDeleteDiscardOpen] = useState(false);
  const {
    form,
    updateField,
    hasChanges,
    discardSource,
    setDiscardSource,
    tryClose,
    confirmDiscard,
  } = useDiscardableForm<BoardFormData>({
    defaultValue: DEFAULT_FORM,
    initialValues,
    open,
  });

  const handleClose = () => onOpenChange(false);
  const handleTryClose = (source: 'close' | 'cancel') => tryClose(source, handleClose);
  const handleDiscardConfirm = () => confirmDiscard(handleClose);
  const dismissDiscard = () => setDiscardSource(null);

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSubmit?.(form);
    handleClose();
  };

  const handleDescriptionChange = (value: string) => {
    if (value.length > DESCRIPTION_MAX) return;
    updateField('description', value);
  };

  const isValid = form.name.trim().length > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleTryClose('close');
        else onOpenChange(true);
      }}
    >
      <DialogContent
        className="bg-background flex w-215 max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-lg p-0"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="flex h-24 items-center justify-between px-600">
          <h2 className="typo-h3 text-text-normal">{title}</h2>
          <div className="flex items-center gap-200">
            {onDelete && (
              <div className="relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <ModalIconButton icon={AdminMeatballIcon} label="더보기" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      destructive
                      onSelect={() => {
                        requestAnimationFrame(() => {
                          if (hasChanges) {
                            setDeleteDiscardOpen(true);
                          } else {
                            setDeleteOpen(true);
                          }
                        });
                      }}
                    >
                      게시판 삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <CustomAlertDialog
                  open={deleteDiscardOpen}
                  onOpenChange={setDeleteDiscardOpen}
                  title={discardMessages.title}
                  actionLabel={discardMessages.actionLabel}
                  cancelLabel={discardMessages.cancelLabel}
                  onAction={() => {
                    setDeleteDiscardOpen(false);
                    onDelete?.();
                  }}
                  onDismiss={() => setDeleteDiscardOpen(false)}
                  placement="below-right"
                />
                <DeleteBoardDialog
                  name={form.name}
                  open={deleteOpen}
                  onOpenChange={setDeleteOpen}
                  onConfirm={() => {
                    setDeleteOpen(false);
                    onDelete();
                  }}
                />
              </div>
            )}
            <div className="relative">
              <ModalIconButton
                icon={AdminCloseIcon}
                label="닫기"
                onClick={() => handleTryClose('close')}
              />
              <DiscardConfirmDialog
                source="close"
                currentSource={discardSource}
                messages={discardMessages}
                onConfirm={handleDiscardConfirm}
                onDismiss={dismissDiscard}
                placement="below-right"
              />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="scrollbar-custom tablet:px-17.75 flex max-h-175 flex-col gap-400 overflow-y-auto px-700 pt-200 pb-400">
          <BoardFormField label="게시판 이름" htmlFor="board-name">
            <input
              id="board-name"
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="게시판의 이름을 작성해주세요"
              className="bg-container-neutral typo-body1 placeholder:text-text-alternative text-text-normal h-12 w-full rounded-sm px-400 py-300 focus:outline-none"
            />
          </BoardFormField>

          <BoardFormField label="설명" htmlFor="board-description">
            <input
              id="board-description"
              type="text"
              value={form.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="게시판을 알아볼 수 있는 설명을 짧게 작성해주세요."
              maxLength={DESCRIPTION_MAX}
              className="bg-container-neutral typo-body1 placeholder:text-text-alternative text-text-normal h-12 w-full rounded-sm px-400 py-300 focus:outline-none"
            />
            <div className="flex h-8 items-center px-400">
              <p className="typo-caption2 text-text-alternative">
                최대 {DESCRIPTION_MAX}자 ({form.description.length}/{DESCRIPTION_MAX})
              </p>
            </div>
          </BoardFormField>

          {/* 접근 권한 */}
          <div className="flex flex-col">
            <span className="typo-sub3 text-text-normal flex h-12 items-center px-400">
              접근 권한
            </span>
            <div
              role="radiogroup"
              aria-label="접근 권한"
              className="scrollbar-none flex gap-200 overflow-x-auto py-200"
            >
              {VISIBILITY_OPTIONS.map(({ value, label }) => {
                const selected = form.visibility === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => updateField('visibility', value)}
                    className={cn(
                      'typo-button2 flex min-w-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] px-400 py-200 transition-colors',
                      selected
                        ? 'bg-button-primary text-text-inverse'
                        : 'border-line text-text-strong border',
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 댓글 허용 */}
          <div className="flex flex-col">
            <span className="typo-sub3 text-text-normal flex h-12 items-center px-400">
              댓글 허용
            </span>
            <div className="flex p-200">
              <Switch
                checked={form.commentEnabled}
                onCheckedChange={(next) => updateField('commentEnabled', next)}
                aria-label="댓글 허용"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-container-neutral flex items-center justify-end gap-200 px-400 pt-400 pb-500">
          <div className="relative">
            <Button variant="secondary" size="lg" onClick={() => handleTryClose('cancel')}>
              취소
            </Button>
            <DiscardConfirmDialog
              source="cancel"
              currentSource={discardSource}
              messages={discardMessages}
              onConfirm={handleDiscardConfirm}
              onDismiss={dismissDiscard}
              placement="above-right"
            />
          </div>
          <Button variant="primary" size="lg" disabled={!isValid} onClick={handleSubmit}>
            저장
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface BoardFormFieldProps {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}

function BoardFormField({ label, htmlFor, children }: BoardFormFieldProps) {
  return (
    <div className="flex flex-col">
      <label
        htmlFor={htmlFor}
        className="typo-caption1 text-text-normal flex h-12 items-center px-400"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export { BoardFormModal, type BoardFormModalProps, type BoardFormData };
