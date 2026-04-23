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
import type { Schedule } from '@/types/admin/schedule';

import { useUpdateSchedule } from '@/hooks/queries/admin/useAdminScheduleQueries';
import {
  isFormChanged,
  isScheduleContentValid,
  isScheduleLocationValid,
  isScheduleTitleValid,
  toInitialScheduleForm,
} from '@/utils/admin/scheduleFormUtils';

import { DiscardConfirmArea } from './DiscardConfirmArea';
import { ScheduleFormBody } from './ScheduleFormBody';
import { isDateRangeValid } from './types';
import type { ScheduleFormState } from './types';

interface EditScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: Schedule;
  onDelete?: (schedule: Schedule) => void;
}

function EditScheduleModal({ open, onOpenChange, schedule, onDelete }: EditScheduleModalProps) {
  const initialForm = toInitialScheduleForm(schedule);
  const [form, setForm] = useState<ScheduleFormState>(initialForm);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [discardSource, setDiscardSource] = useState<'close' | 'cancel' | null>(null);

  const { mutate, isPending } = useUpdateSchedule();

  const hasChanges = isFormChanged(form, initialForm);

  const isValid =
    isScheduleTitleValid(form.title) &&
    isScheduleLocationValid(form.location) &&
    isScheduleContentValid(form.content) &&
    isDateRangeValid(form);

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
    if (!isValid) return;
    mutate(
      {
        eventId: schedule.id,
        body: {
          title: form.title,
          content: form.content,
          location: form.location,
          start: `${form.startDate}T${form.startTime}:00`,
          end: `${form.endDate}T${form.endTime}:00`,
        },
      },
      { onSuccess: handleClose },
    );
  };

  const handleDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    handleClose();
    onDelete?.(schedule);
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
          className="bg-background flex w-215 max-w-215 flex-col gap-0 overflow-hidden rounded-lg p-0"
          showCloseButton={false}
          onPointerDownOutside={(e) => {
            if (hasChanges) e.preventDefault();
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-700 pt-700">
            <div className="flex h-8 items-end">
              <span className="typo-button2 text-text-strong border-brand-primary border-b-2 px-100 pb-200">
                일반 일정
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
                    일반 일정 삭제
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
          <div className="scrollbar-custom max-h-175 overflow-y-auto px-700">
            <h2 className="typo-h3 text-text-normal py-400">일반 일정 수정</h2>
            <ScheduleFormBody
              form={form}
              onFormChange={updateForm}
              titleLabel="일정 제목"
              titlePlaceholder="예 : 중간고사 기간"
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
              disabled={!isValid || isPending}
              onClick={handleSubmit}
            >
              저장
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 */}
      <CustomAlertDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="이 일정을 삭제하시겠어요?"
        description={'삭제된 일정은 복구할 수 없습니다.\n신중히 확인 후 진행해 주세요.'}
        actionLabel="삭제"
        onAction={handleDeleteConfirm}
        placement="center"
      />
    </>
  );
}

export { EditScheduleModal, type EditScheduleModalProps };
