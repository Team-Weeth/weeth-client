'use client';

import { useState } from 'react';

import { Button, Icon, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AdminCloseIcon } from '@/assets/icons/admin';
import { ScheduleFormField } from '@/components/admin/schedule/ScheduleFormField';
import { DateTimeInput } from '@/components/admin/schedule/DateTimeInput';

type ScheduleFormTab = 'GENERAL' | 'SESSION';

const TAB_TITLE: Record<ScheduleFormTab, string> = {
  GENERAL: '일반 일정 생성',
  SESSION: '세션 생성',
};

function getDefaultDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface CreateScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardinalNumber: number | null;
}

function CreateScheduleModal({ open, onOpenChange, cardinalNumber }: CreateScheduleModalProps) {
  const [activeTab, setActiveTab] = useState<ScheduleFormTab>('GENERAL');
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(getDefaultDate());
  const [startTime, setStartTime] = useState('00:00');
  const [endDate, setEndDate] = useState(getDefaultDate());
  const [endTime, setEndTime] = useState('23:59');
  const [location, setLocation] = useState('');
  const [content, setContent] = useState('');

  const resetForm = () => {
    setTitle('');
    setStartDate(getDefaultDate());
    setStartTime('00:00');
    setEndDate(getDefaultDate());
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

  const isValid = title.trim().length > 0 && cardinalNumber !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-background flex w-215 max-w-[860px] flex-col gap-0 overflow-hidden rounded-lg p-0"
        showCloseButton={false}
      >
        {/* Header with tabs */}
        <div className="flex items-start justify-between px-700 pt-700">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as ScheduleFormTab)}
            className="gap-0"
          >
            <TabsList variant="line" className="h-8">
              <TabsTrigger value="GENERAL">일반 일정</TabsTrigger>
              <TabsTrigger value="SESSION">세션</TabsTrigger>
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
          <h2 className="typo-h3 text-text-normal py-400">{TAB_TITLE[activeTab]}</h2>

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
