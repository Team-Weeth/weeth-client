'use client';

import { Button, Switch } from '@/components/ui';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { DiscardConfirmDialog } from '@/components/admin/modal/DiscardConfirmDialog';
import { BoardFormField } from '@/components/admin/board/modal/BoardFormField';
import { BoardFormHeader } from '@/components/admin/board/modal/BoardFormHeader';
import {
  NAME_MAX,
  DESCRIPTION_MAX,
  VISIBILITY_OPTIONS,
  DEFAULT_FORM,
  DISCARD_MESSAGES,
  type BoardFormData,
  type BoardFormMode,
} from '@/components/admin/board/modal/constants';
import { cn } from '@/lib/cn';
import { useDiscardableForm } from '@/hooks/useDiscardableForm';

interface BoardFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  mode?: BoardFormMode;
  initialValues?: Partial<BoardFormData>;
  onSubmit?: (data: BoardFormData) => void;
  onDelete?: () => void;
  nameError?: string | null;
  onNameChange?: () => void;
}

function BoardFormModal({
  open,
  onOpenChange,
  title,
  mode = 'edit',
  initialValues,
  onSubmit,
  onDelete,
  nameError,
  onNameChange,
}: BoardFormModalProps) {
  const discardMessages = DISCARD_MESSAGES[mode];
  const { form, updateField, discardSource, setDiscardSource, tryClose, confirmDiscard } =
    useDiscardableForm<BoardFormData>({
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
  };

  const handleNameChange = (value: string) => {
    if (value.length > NAME_MAX) return;
    updateField('name', value);
    onNameChange?.();
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
        <BoardFormHeader
          title={title}
          boardName={form.name}
          discardSource={discardSource}
          setDiscardSource={setDiscardSource}
          discardMessages={discardMessages}
          onTryClose={() => handleTryClose('close')}
          onDiscardConfirm={handleDiscardConfirm}
          onDelete={onDelete}
        />

        {/* Body */}
        <div className="scrollbar-custom tablet:px-17.75 flex max-h-175 flex-col gap-400 overflow-y-auto px-700 pt-200 pb-400">
          <BoardFormField label="게시판 이름" htmlFor="board-name">
            <input
              id="board-name"
              type="text"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="게시판의 이름을 작성해주세요"
              maxLength={NAME_MAX}
              className={cn(
                'bg-container-neutral typo-body1 placeholder:text-text-alternative text-text-normal h-12 w-full rounded-sm px-400 py-300 focus:outline-none',
                nameError && 'border border-state-error',
              )}
            />
            <div className="flex h-8 items-center px-400">
              {nameError ? (
                <p className="typo-caption2 text-state-error">{nameError}</p>
              ) : (
                <p className="typo-caption2 text-text-alternative">
                  최대 {NAME_MAX}자 ({form.name.length}/{NAME_MAX})
                </p>
              )}
            </div>
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

          <BoardFormField label="접근 권한" labelVariant="sub3">
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
          </BoardFormField>

          <BoardFormField label="댓글 허용" labelVariant="sub3">
            <div className="flex p-200">
              <Switch
                checked={form.commentEnabled}
                onCheckedChange={(next) => updateField('commentEnabled', next)}
                aria-label="댓글 허용"
              />
            </div>
          </BoardFormField>
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

export { BoardFormModal, type BoardFormModalProps };
export type { BoardFormData } from '@/components/admin/board/modal/constants';
