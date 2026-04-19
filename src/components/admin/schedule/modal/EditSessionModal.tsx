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
import { ScheduleFormField } from '@/components/admin/schedule/ScheduleFormField';
import { DateTimeInput } from '@/components/ui/DateTimeInput';
import type { AdminSession, AdminSessionGroup } from '@/types/admin/session';

import type { ScheduleFormState } from './types';

function isSessionGroup(target: AdminSession | AdminSessionGroup): target is AdminSessionGroup {
  return 'groupId' in target;
}

function toInitialForm(target: AdminSession | AdminSessionGroup): ScheduleFormState {
  if (isSessionGroup(target)) {
    return {
      title: target.title,
      startDate: target.startDate,
      startTime: '00:00',
      endDate: target.endDate,
      endTime: '23:59',
      location: '',
      content: '',
    };
  }
  return {
    title: target.title,
    startDate: target.start.slice(0, 10),
    startTime: target.start.slice(11, 16),
    endDate: target.end.slice(0, 10),
    endTime: target.end.slice(11, 16),
    location: '',
    content: '',
  };
}

function isFormChanged(a: ScheduleFormState, b: ScheduleFormState): boolean {
  return (Object.keys(a) as (keyof ScheduleFormState)[]).some((key) => a[key] !== b[key]);
}

type SessionDeleteType = 'this' | 'all';
type SessionSaveType = 'this' | 'all';

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
  const initialForm = toInitialForm(target);
  const [form, setForm] = useState<ScheduleFormState>(initialForm);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
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
    if (isSessionGroup(target)) {
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
                세션
              </span>
            </div>
            <div className="flex items-center gap-200">
              {/* Meatball menu */}
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
                  onOpenChange={(o) => {
                    if (!o && discardSource === 'close') setDiscardSource(null);
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
          <div className="scrollbar-custom max-h-[700px] overflow-y-auto px-[60px]">
            <h2 className="typo-h3 text-text-normal py-400">세션 수정</h2>

            <div className="flex flex-col gap-400 py-400">
              {/* Title */}
              <ScheduleFormField label="세션 제목">
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="예 : 7기 정기 모임"
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
                onOpenChange={(o) => {
                  if (!o && discardSource === 'cancel') setDiscardSource(null);
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

      {/* 저장 버튼 확인 */}
      <CustomAlertDialog
        open={saveConfirmOpen}
        onOpenChange={setSaveConfirmOpen}
        title={'이 변경사항을 어떻게 저장할까요?'}
        actionLabel="이 세션 일정만 저장"
        onAction={() => handleSaveConfirm('this')}
        secondActionLabel="이후 모든 세션 일정에 대해 저장"
        onSecondAction={() => handleSaveConfirm('all')}
        placement="center"
        tone="primary"
      />

      {/*삭제 버튼 확인*/}
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
