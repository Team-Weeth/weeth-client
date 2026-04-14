'use client';

import { useState } from 'react';

import { Button, Icon, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AdminCloseIcon } from '@/assets/icons/admin';
import { ScheduleFormField } from '@/components/admin/schedule/ScheduleFormField';
import { DateTimeInput } from '@/components/ui/DateTimeInput';
import { SCHEDULE_TYPE_LABEL } from '@/constants/admin/schedule.constants';
import type { ScheduleType } from '@/types/admin/schedule';
import { toDateInputValue } from '@/utils/shared/date';

interface CreateScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardinalNumber: number | null;
}

function CreateScheduleModal({ open, onOpenChange, cardinalNumber }: CreateScheduleModalProps) {
  const [activeTab, setActiveTab] = useState<ScheduleType>('GENERAL');
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(toDateInputValue());
  const [startTime, setStartTime] = useState('00:00');
  const [endDate, setEndDate] = useState(toDateInputValue());
  const [endTime, setEndTime] = useState('23:55');
  const [location, setLocation] = useState('');
  const [content, setContent] = useState('');

  const resetForm = () => {
    setTitle('');
    setStartDate(toDateInputValue());
    setStartTime('00:00');
    setEndDate(toDateInputValue());
    setEndTime('23:59');
    setLocation('');
    setContent('');
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const handleSubmit = () => {
    if (!title.trim() || cardinalNumber === null) return;
    // TODO: API 연동 시 onSubmit 콜백으로 교체
    handleClose();
  };

  const isValid = title.trim().length > 0 && startDate < endDate && cardinalNumber !== null;

  const handleDialogOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        className="bg-background flex w-215 max-w-[860px] flex-col gap-0 overflow-hidden rounded-lg p-0"
        showCloseButton={false}
      >
        {/* Header with tabs */}
        <div className="flex items-start justify-between px-700 pt-700">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as ScheduleType)}
            className="gap-0"
          >
            <TabsList variant="line" className="h-8">
              <TabsTrigger value="GENERAL">{SCHEDULE_TYPE_LABEL.GENERAL}</TabsTrigger>
              <TabsTrigger value="SESSION">{SCHEDULE_TYPE_LABEL.SESSION}</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="hidden" />
          </Tabs>
          <button
            type="button"
            onClick={handleClose}
            className="flex cursor-pointer items-center justify-center rounded-sm p-200"
            aria-label="닫기"
          >
            <Icon src={AdminCloseIcon} size={24} alt="닫기" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="scrollbar-custom max-h-[700px] overflow-y-auto px-700">
          <h2 className="typo-h3 text-text-normal py-400">{`${SCHEDULE_TYPE_LABEL[activeTab]} 생성`}</h2>

          <div className="flex flex-col gap-400 py-400">
            {/* Title */}
            <ScheduleFormField label="일정 제목">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예 : 중간고사 기간"
                className="bg-container-neutral typo-body1 placeholder:text-text-alternative h-12 w-full rounded-sm px-400 py-300 focus:outline-none"
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
                className="bg-container-neutral typo-body1 placeholder:text-text-alternative h-12 w-full rounded-sm px-400 py-300 focus:outline-none"
              />
            </ScheduleFormField>

            {/* Content */}
            <ScheduleFormField label="일정 설명 (선택)">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="일정에 대한 설명을 입력해주세요."
                className="bg-container-neutral typo-body1 placeholder:text-text-alternative h-[150px] w-full resize-none rounded-sm px-400 py-300 focus:outline-none"
              />
            </ScheduleFormField>
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

export { CreateScheduleModal, type CreateScheduleModalProps };
