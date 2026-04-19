'use client';

import { useState } from 'react';

import { Button, Icon, Switch } from '@/components/ui';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AdminCloseIcon } from '@/assets/icons/admin';
import { cn } from '@/lib/cn';
import type { BoardVisibility } from '@/types/admin/board';

const DESCRIPTION_MAX = 30;

const VISIBILITY_OPTIONS: { value: BoardVisibility; label: string }[] = [
  { value: 'PUBLIC', label: '전체 공개' },
  { value: 'ADMIN_ONLY', label: '관리자 전용' },
  { value: 'PRIVATE', label: '비공개' },
];

interface CreateBoardFormData {
  name: string;
  description: string;
  visibility: BoardVisibility;
  commentEnabled: boolean;
}

const INITIAL_FORM: CreateBoardFormData = {
  name: '',
  description: '',
  visibility: 'PUBLIC',
  commentEnabled: true,
};

interface CreateBoardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: CreateBoardFormData) => void;
}

function CreateBoardModal({ open, onOpenChange, onSubmit }: CreateBoardModalProps) {
  const [form, setForm] = useState<CreateBoardFormData>(INITIAL_FORM);

  const updateField = <K extends keyof CreateBoardFormData>(
    key: K,
    value: CreateBoardFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => setForm(INITIAL_FORM);

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

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
        if (!next) handleClose();
        else onOpenChange(true);
      }}
    >
      <DialogContent
        className="bg-background flex w-215 max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-lg p-0"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="flex h-24 items-center justify-between px-600">
          <h2 className="typo-h3 text-text-normal">게시판 생성</h2>
          <button
            type="button"
            onClick={handleClose}
            className="flex cursor-pointer items-center justify-center rounded-sm p-200"
            aria-label="닫기"
          >
            <Icon src={AdminCloseIcon} size={24} alt="닫기" />
          </button>
        </div>

        {/* Body */}
        <div className="scrollbar-custom flex max-h-[700px] flex-col gap-400 overflow-y-auto px-700 pt-200 pb-400 tablet:px-[71px]">
          {/* 게시판 이름 */}
          <div className="flex flex-col">
            <label htmlFor="board-name" className="typo-caption1 text-text-normal flex h-12 items-center px-400">
              게시판 이름
            </label>
            <input
              id="board-name"
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="게시판의 이름을 작성해주세요"
              className="bg-container-neutral typo-body1 placeholder:text-text-alternative text-text-normal h-12 w-full rounded-sm px-400 py-300 focus:outline-none"
            />
          </div>

          {/* 설명 */}
          <div className="flex flex-col">
            <label
              htmlFor="board-description"
              className="typo-caption1 text-text-normal flex h-12 items-center px-400"
            >
              설명
            </label>
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
          </div>

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
          <Button variant="secondary" size="lg" onClick={handleClose}>
            취소
          </Button>
          <Button variant="primary" size="lg" disabled={!isValid} onClick={handleSubmit}>
            저장
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export {
  CreateBoardModal,
  type CreateBoardModalProps,
  type CreateBoardFormData,
};
