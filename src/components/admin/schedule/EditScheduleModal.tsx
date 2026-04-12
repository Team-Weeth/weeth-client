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
import { DateTimeInput } from '@/components/admin/schedule/DateTimeInput';
import type { Schedule } from '@/types/admin/schedule';

function toDateStr(iso: string): string {
  return iso.slice(0, 10);
}

function toTimeStr(iso: string): string {
  return iso.slice(11, 16);
}

interface EditScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: Schedule;
  onDelete?: (schedule: Schedule) => void;
}

function EditScheduleModal({ open, onOpenChange, schedule, onDelete }: EditScheduleModalProps) {
  const initDate = toDateStr(schedule.startDateTime);
  const initTime = toTimeStr(schedule.startDateTime);
  const initEndDate = toDateStr(schedule.endDateTime);
  const initEndTime = toTimeStr(schedule.endDateTime);

  const [title, setTitle] = useState(schedule.title);
  const [startDate, setStartDate] = useState(initDate);
  const [startTime, setStartTime] = useState(initTime);
  const [endDate, setEndDate] = useState(initEndDate);
  const [endTime, setEndTime] = useState(initEndTime);
  const [location, setLocation] = useState(schedule.location);
  const [content, setContent] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);

  const hasChanges =
    title !== schedule.title ||
    startDate !== initDate ||
    startTime !== initTime ||
    endDate !== initEndDate ||
    endTime !== initEndTime ||
    location !== schedule.location ||
    content !== '';

  const handleClose = () => onOpenChange(false);

  const handleTryClose = () => {
    if (hasChanges) {
      setDiscardConfirmOpen(true);
    } else {
      handleClose();
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    // TODO: API 연동 시 수정 요청
    handleClose();
  };

  const handleDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    handleClose();
    onDelete?.(schedule);
  };

  const handleDiscardConfirm = () => {
    setDiscardConfirmOpen(false);
    handleClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            handleTryClose();
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
              <button
                type="button"
                onClick={handleTryClose}
                className="flex cursor-pointer items-center justify-center rounded-sm p-200"
                aria-label="닫기"
              >
                <Icon src={AdminCloseIcon} size={24} alt="닫기" />
              </button>
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
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예 : 중간고사 기간"
                  className="bg-container-neutral typo-body1 placeholder:text-text-alternative text-text-normal h-12 w-full rounded-sm px-400 py-300 focus:outline-none"
                />
              </ScheduleFormField>

              {/* Start / End dates */}
              <div className="flex gap-600">
                <DateTimeInput
                  label="시작 일자"
                  dateValue={startDate}
                  timeValue={startTime}
                  onDateChange={setStartDate}
                  onTimeChange={setStartTime}
                />
                <DateTimeInput
                  label="종료 일자"
                  dateValue={endDate}
                  timeValue={endTime}
                  onDateChange={setEndDate}
                  onTimeChange={setEndTime}
                />
              </div>

              {/* Location */}
              <ScheduleFormField label="모임 장소 (선택)">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="장소를 입력해주세요."
                  className="bg-container-neutral typo-body1 placeholder:text-text-alternative text-text-normal h-12 w-full rounded-sm px-400 py-300 focus:outline-none"
                />
              </ScheduleFormField>

              {/* Content */}
              <ScheduleFormField label="일정 설명 (선택)">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="일정에 대한 설명을 입력해주세요."
                  className="bg-container-neutral typo-body1 placeholder:text-text-alternative text-text-normal h-[150px] w-full resize-none rounded-sm px-400 py-300 focus:outline-none"
                />
              </ScheduleFormField>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-container-neutral flex items-center justify-end gap-200 px-400 pt-400 pb-500">
            <Button variant="secondary" size="lg" onClick={handleTryClose}>
              취소
            </Button>
            <Button variant="primary" size="lg" disabled={!title.trim()} onClick={handleSubmit}>
              저장
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Discard changes confirmation */}
      <CustomAlertDialog
        open={discardConfirmOpen}
        onOpenChange={setDiscardConfirmOpen}
        title={'변경사항이 있어요.\n변경사항을 폐기할까요?'}
        actionLabel="변경사항 폐기"
        onAction={handleDiscardConfirm}
      />

      {/* Delete confirmation */}
      <CustomAlertDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="이 일정을 삭제하시겠어요?"
        description={'삭제된 일정은 복구할 수 없습니다.\n신중히 확인 후 진행해 주세요.'}
        actionLabel="삭제"
        onAction={handleDeleteConfirm}
      />
    </>
  );
}

export { EditScheduleModal, type EditScheduleModalProps };
