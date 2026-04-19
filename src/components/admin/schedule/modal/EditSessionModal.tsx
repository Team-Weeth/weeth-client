'use client';

import { useState } from 'react';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
} from '@/components/ui';
import { CustomAlertDialog } from '@/components/alert';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AdminCloseIcon, AdminMeatballIcon } from '@/assets/icons/admin';
import type { AdminSession, AdminSessionGroup } from '@/types/admin/session';

import { DiscardConfirmArea } from './DiscardConfirmArea';
import { ScheduleFormBody } from './ScheduleFormBody';
import { isFormChanged, isSessionGroup, toInitialSessionForm } from './scheduleFormUtils';
import type { ScheduleFormState, SessionDeleteType, SessionSaveType } from './types';

interface EditSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: AdminSession | AdminSessionGroup;
  onDelete?: (type: SessionDeleteType) => void;
  onSave?: (type: SessionSaveType) => void;
}

function EditSessionModal({
  open,
  onOpenChange,
  target,
  onDelete,
  onSave,
}: EditSessionModalProps) {
  const initialForm = toInitialSessionForm(target);
  const [form, setForm] = useState<ScheduleFormState>(initialForm);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [discardSource, setDiscardSource] = useState<'close' | 'cancel' | null>(null);

  const hasChanges = isFormChanged(form, initialForm);
  const isRecurring = isSessionGroup(target);

  const updateForm = (patch: Partial<ScheduleFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const handleClose = () => onOpenChange(false);

  const handleTryClose = (source: 'close' | 'cancel') => {
    if (hasChanges) {
      setDiscardSource(source);
    } else {
      handleClose();
    }
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    if (isRecurring) {
      setSaveConfirmOpen(true);
    } else {
      // TODO: API 연동 시 세션 수정 요청
      handleClose();
    }
  };

  const handleSaveConfirm = (type: SessionSaveType) => {
    setSaveConfirmOpen(false);
    handleClose();
    onSave?.(type);
  };

  const handleDeleteConfirm = (type: SessionDeleteType) => {
    setDeleteConfirmOpen(false);
    handleClose();
    onDelete?.(type);
  };

  const handleDiscardConfirm = () => {
    setDiscardSource(null);
    handleClose();
  };

  const closeDiscardAlert = (source: 'close' | 'cancel') => (next: boolean) => {
    if (!next && discardSource === source) setDiscardSource(null);
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) handleTryClose('close');
        }}
      >
        <DialogContent
          className="bg-background flex w-215 max-w-[860px] flex-col gap-0 overflow-hidden rounded-lg p-0"
          showCloseButton={false}
          onPointerDownOutside={(e) => {
            if (hasChanges) e.preventDefault();
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-700 pt-700">
            <div className="flex h-8 items-end">
              <span className="typo-button2 text-text-strong border-brand-primary border-b-2 px-100 pb-200">
                세션
              </span>
            </div>
            <div className="flex items-center gap-200">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex cursor-pointer items-center justify-center rounded-sm p-200"
                  >
                    <Icon src={AdminMeatballIcon} size={24} alt="메뉴" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem destructive onSelect={() => setDeleteConfirmOpen(true)}>
                    세션 삭제
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DiscardConfirmArea
                open={discardSource === 'close'}
                onOpenChange={closeDiscardAlert('close')}
                onConfirm={handleDiscardConfirm}
                placement="below-right"
              >
                <button
                  type="button"
                  onClick={() => handleTryClose('close')}
                  className="flex cursor-pointer items-center justify-center rounded-sm p-200"
                  aria-label="닫기"
                >
                  <Icon src={AdminCloseIcon} size={24} alt="닫기" />
                </button>
              </DiscardConfirmArea>
            </div>
          </div>

          {/* Body */}
          <div className="scrollbar-custom max-h-[700px] overflow-y-auto px-[60px]">
            <h2 className="typo-h3 text-text-normal py-400">세션 수정</h2>
            <ScheduleFormBody
              form={form}
              onFormChange={updateForm}
              titleLabel="세션 제목"
              titlePlaceholder="예 : 7기 정기 모임"
            />
          </div>

          {/* Footer */}
          <div className="bg-container-neutral flex items-center justify-end gap-200 px-400 pt-400 pb-500">
            <DiscardConfirmArea
              open={discardSource === 'cancel'}
              onOpenChange={closeDiscardAlert('cancel')}
              onConfirm={handleDiscardConfirm}
              placement="above-right"
            >
              <Button variant="secondary" size="lg" onClick={() => handleTryClose('cancel')}>
                취소
              </Button>
            </DiscardConfirmArea>
            <Button
              variant="primary"
              size="lg"
              disabled={!form.title.trim()}
              onClick={handleSubmit}
            >
              저장
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 저장 확인 (반복 세션 전용) */}
      <CustomAlertDialog
        open={saveConfirmOpen}
        onOpenChange={setSaveConfirmOpen}
        title="이 변경사항을 어떻게 저장할까요?"
        actionLabel="이 세션 일정만 저장"
        onAction={() => handleSaveConfirm('this')}
        secondActionLabel="이후 모든 세션 일정에 대해 저장"
        onSecondAction={() => handleSaveConfirm('all')}
        placement="center"
        tone="primary"
      />

      {/* 삭제 확인 */}
      <CustomAlertDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={'이 세션을 삭제하시겠어요?\n반복 설정이 되어있는 세션이에요.'}
        actionLabel="이 세션 일정만 삭제"
        onAction={() => handleDeleteConfirm('this')}
        secondActionLabel="이후 모든 세션 일정 삭제"
        onSecondAction={() => handleDeleteConfirm('all')}
        placement="center"
      />
    </>
  );
}

export { EditSessionModal, type EditSessionModalProps };
