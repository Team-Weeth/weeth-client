'use client';

import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
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
import { ScheduleFormField } from '@/components/admin/schedule/ScheduleFormField';
import { DateTimeInput } from '@/components/ui/DateTimeInput';
import type { Schedule } from '@/types/admin/schedule';

interface ScheduleFormState {
  title: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string;
  content: string;
}

function toInitialForm(schedule: Schedule): ScheduleFormState {
  return {
    title: schedule.title,
    startDate: schedule.startDateTime.slice(0, 10),
    startTime: schedule.startDateTime.slice(11, 16),
    endDate: schedule.endDateTime.slice(0, 10),
    endTime: schedule.endDateTime.slice(11, 16),
    location: schedule.location,
    content: '',
  };
}

function isFormChanged(a: ScheduleFormState, b: ScheduleFormState): boolean {
  return (Object.keys(a) as (keyof ScheduleFormState)[]).some((key) => a[key] !== b[key]);
}

interface EditScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: Schedule;
  onDelete?: (schedule: Schedule) => void;
}

function EditScheduleModal({ open, onOpenChange, schedule, onDelete }: EditScheduleModalProps) {
  const initialForm = toInitialForm(schedule);
  const [form, setForm] = useState<ScheduleFormState>(initialForm);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [discardSource, setDiscardSource] = useState<'close' | 'cancel' | null>(null);

  const updateField = <K extends keyof ScheduleFormState>(key: K, value: ScheduleFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const hasChanges = isFormChanged(form, initialForm);

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
    // TODO: API 연동 시 수정 요청
    handleClose();
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

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            handleTryClose('close');
          }
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
                일반 일정
              </span>
            </div>
            <div className="flex items-center gap-200">
              {/* Menu button */}
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

              {/* Close button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => handleTryClose('close')}
                  className="flex cursor-pointer items-center justify-center rounded-sm p-200"
                  aria-label="닫기"
                >
                  <Icon src={AdminCloseIcon} size={24} alt="닫기" />
                </button>
                <CustomAlertDialog
                  open={discardSource === 'close'}
                  onOpenChange={(open) => {
                    if (!open && discardSource === 'close') setDiscardSource(null);
                  }}
                  title={'변경사항이 있어요.\n변경사항을 폐기할까요?'}
                  actionLabel="변경사항 폐기"
                  onAction={handleDiscardConfirm}
                  placement="below-right"
                />
              </div>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="scrollbar-custom max-h-[700px] overflow-y-auto px-700">
            <h2 className="typo-h3 text-text-normal py-400">일반 일정 수정</h2>

            <div className="flex flex-col gap-400 py-400">
              {/* Title */}
              <ScheduleFormField label="일정 제목">
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="예 : 중간고사 기간"
                  className="bg-container-neutral typo-body1 placeholder:text-text-alternative text-text-normal h-12 w-full rounded-sm px-400 py-300 focus:outline-none"
                />
              </ScheduleFormField>

              {/* Start / End dates */}
              <div className="flex gap-600">
                <DateTimeInput
                  label="시작 일자"
                  dateValue={form.startDate}
                  timeValue={form.startTime}
                  onDateChange={(v) => updateField('startDate', v)}
                  onTimeChange={(v) => updateField('startTime', v)}
                />
                <DateTimeInput
                  label="종료 일자"
                  dateValue={form.endDate}
                  timeValue={form.endTime}
                  onDateChange={(v) => updateField('endDate', v)}
                  onTimeChange={(v) => updateField('endTime', v)}
                />
              </div>

              {/* Location */}
              <ScheduleFormField label="모임 장소 (선택)">
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="장소를 입력해주세요."
                  className="bg-container-neutral typo-body1 placeholder:text-text-alternative text-text-normal h-12 w-full rounded-sm px-400 py-300 focus:outline-none"
                />
              </ScheduleFormField>

              {/* Content */}
              <ScheduleFormField label="일정 설명 (선택)">
                <textarea
                  value={form.content}
                  onChange={(e) => updateField('content', e.target.value)}
                  placeholder="일정에 대한 설명을 입력해주세요."
                  className="bg-container-neutral typo-body1 placeholder:text-text-alternative text-text-normal h-[150px] w-full resize-none rounded-sm px-400 py-300 focus:outline-none"
                />
              </ScheduleFormField>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-container-neutral flex items-center justify-end gap-200 px-400 pt-400 pb-500">
            <div className="relative">
              <Button variant="secondary" size="lg" onClick={() => handleTryClose('cancel')}>
                취소
              </Button>
              <CustomAlertDialog
                open={discardSource === 'cancel'}
                onOpenChange={(open) => {
                  if (!open && discardSource === 'cancel') setDiscardSource(null);
                }}
                title={'변경사항이 있어요.\n변경사항을 폐기할까요?'}
                actionLabel="변경사항 폐기"
                onAction={handleDiscardConfirm}
                placement="above-right"
              />
            </div>
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

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        status="danger"
        title="이 일정을 삭제하시겠어요?"
        description={'삭제된 일정은 복구할 수 없습니다.\n신중히 확인 후 진행해 주세요.'}
      >
        <AlertDialogAction onClick={handleDeleteConfirm}>삭제</AlertDialogAction>
        <AlertDialogCancel>취소</AlertDialogCancel>
      </AlertDialog>
    </>
  );
}

export { EditScheduleModal, type EditScheduleModalProps };
