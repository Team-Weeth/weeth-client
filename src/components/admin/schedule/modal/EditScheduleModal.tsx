'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import { CustomAlertDialog } from '@/components/alert';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AdminCloseIcon, AdminMeatballIcon } from '@/assets/icons/admin';
import { ModalIconButton } from '@/components/admin';
import type { Schedule } from '@/types/admin/schedule';
import {
  useAdminScheduleDetail,
  useUpdateSchedule,
} from '@/hooks/queries/admin/useAdminScheduleQueries';
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
  const hasChangesRef = useRef(false);
  const requestCloseRef = useRef<(() => void) | null>(null);

  const handleClose = () => onOpenChange(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) return;
        if (requestCloseRef.current) requestCloseRef.current();
        else handleClose();
      }}
    >
      <DialogContent
        className="bg-background flex w-215 max-w-215 flex-col gap-0 overflow-hidden rounded-lg p-0"
        showCloseButton={false}
        onPointerDownOutside={(e) => {
          if (hasChangesRef.current) e.preventDefault();
        }}
      >
        <Suspense fallback={<EditScheduleModalLoading onClose={handleClose} />}>
          <EditScheduleModalContent
            scheduleId={schedule.id}
            onClose={handleClose}
            onDelete={onDelete}
            hasChangesRef={hasChangesRef}
            requestCloseRef={requestCloseRef}
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}

function EditScheduleModalLoading({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="flex items-start justify-between px-700 pt-700">
        <div className="flex h-8 items-end">
          <span className="typo-button2 text-text-strong border-brand-primary border-b-2 px-100 pb-200">
            일반 일정
          </span>
        </div>
        <ModalIconButton icon={AdminCloseIcon} label="닫기" onClick={onClose} />
      </div>
      <div className="flex min-h-150 flex-col px-700 pb-700">
        <h2 className="typo-h3 text-text-normal py-400">일반 일정 수정</h2>
        <div className="flex flex-1 items-center justify-center">
          <p className="typo-body2 text-text-alternative">불러오는 중...</p>
        </div>
      </div>
    </>
  );
}

interface EditScheduleModalContentProps {
  scheduleId: number;
  onClose: () => void;
  onDelete?: (schedule: Schedule) => void;
  hasChangesRef: RefObject<boolean>;
  requestCloseRef: RefObject<(() => void) | null>;
}

function EditScheduleModalContent({
  scheduleId,
  onClose,
  onDelete,
  hasChangesRef,
  requestCloseRef,
}: EditScheduleModalContentProps) {
  const { data: detail } = useAdminScheduleDetail(scheduleId);

  const [initialForm] = useState<ScheduleFormState>(() => toInitialScheduleForm(detail));
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

  const handleTryClose = (source: 'close' | 'cancel') => {
    if (hasChanges) setDiscardSource(source);
    else onClose();
  };

  useEffect(() => {
    hasChangesRef.current = hasChanges;
    requestCloseRef.current = () => {
      if (hasChanges) setDiscardSource('close');
      else onClose();
    };
    return () => {
      hasChangesRef.current = false;
      requestCloseRef.current = null;
    };
  }, [hasChanges, hasChangesRef, onClose, requestCloseRef]);

  const handleSubmit = () => {
    if (!isValid) return;
    mutate(
      {
        eventId: scheduleId,
        body: {
          title: form.title,
          content: form.content,
          location: form.location,
          start: `${form.startDate}T${form.startTime}:00`,
          end: `${form.endDate}T${form.endTime}:00`,
        },
      },
      { onSuccess: onClose },
    );
  };

  const handleDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    onClose();
    onDelete?.(detail);
  };

  const handleDiscardConfirm = () => {
    setDiscardSource(null);
    onClose();
  };

  const closeDiscardAlert = (source: 'close' | 'cancel') => (next: boolean) => {
    if (!next && discardSource === source) setDiscardSource(null);
  };

  return (
    <>
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
              <ModalIconButton icon={AdminMeatballIcon} label="메뉴" />
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
            <ModalIconButton
              icon={AdminCloseIcon}
              label="닫기"
              onClick={() => handleTryClose('close')}
            />
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
