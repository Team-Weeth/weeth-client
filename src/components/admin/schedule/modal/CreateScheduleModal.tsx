'use client';

import { useState } from 'react';

import { Button, Icon, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AdminCloseIcon } from '@/assets/icons/admin';
import { GeneralScheduleForm } from '@/components/admin/schedule/modal/GeneralScheduleForm';
import { SessionScheduleForm } from '@/components/admin/schedule/modal/SessionScheduleForm';
import { SCHEDULE_TYPE_LABEL } from '@/constants/admin/schedule.constants';
import { useCardinals } from '@/hooks/queries';
import type { ScheduleType } from '@/types/admin/schedule';
import type { CreateSessionBody, SessionRecurrenceType } from '@/types/admin/session';
import { toDateInputValue } from '@/utils/shared/date';

interface CreateScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardinalNumber: number | null;
  /** 모달이 열릴 때 활성화할 탭 (기본값: GENERAL) */
  initialTab?: ScheduleType;
  /** 세션 탭에서 저장 시 호출. API 연결 전까지 목업 */
  onCreateSession?: (body: CreateSessionBody) => void;
}

function CreateScheduleModal({
  open,
  onOpenChange,
  cardinalNumber,
  initialTab = 'GENERAL',
  onCreateSession,
}: CreateScheduleModalProps) {
  const [activeTab, setActiveTab] = useState<ScheduleType>(initialTab);
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(toDateInputValue());
  const [startTime, setStartTime] = useState('00:00');
  const [endDate, setEndDate] = useState(toDateInputValue());
  const [endTime, setEndTime] = useState('23:55');
  const [location, setLocation] = useState('');
  const [content, setContent] = useState('');

  // 세션 탭 전용 state
  const { data: cardinals = [] } = useCardinals();
  const [selectedCardinalId, setSelectedCardinalId] = useState<number | null>(null);
  const [recurrenceType, setRecurrenceType] = useState<SessionRecurrenceType>('NONE');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(toDateInputValue());

  const selectedCardinal =
    selectedCardinalId !== null ? cardinals.find((c) => c.id === selectedCardinalId) : null;

  const resetForm = () => {
    setActiveTab(initialTab);
    setTitle('');
    setStartDate(toDateInputValue());
    setStartTime('00:00');
    setEndDate(toDateInputValue());
    setEndTime('23:59');
    setLocation('');
    setContent('');
    setSelectedCardinalId(null);
    setRecurrenceType('NONE');
    setRecurrenceEndDate(toDateInputValue());
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const isSession = activeTab === 'SESSION';
  const isDateRangeValid = startDate < endDate;
  const hasRecurrence = recurrenceType !== 'NONE';
  const isRecurrenceEndValid = !hasRecurrence || recurrenceEndDate >= endDate;

  const isValid = isSession
    ? title.trim().length > 0 &&
      selectedCardinal !== null &&
      selectedCardinal !== undefined &&
      isDateRangeValid &&
      isRecurrenceEndValid
    : title.trim().length > 0 && isDateRangeValid && cardinalNumber !== null;

  const handleSubmit = () => {
    if (!isValid) return;

    if (isSession && selectedCardinal) {
      const body: CreateSessionBody = {
        title: title.trim(),
        content: content.trim(),
        location: location.trim(),
        cardinal: selectedCardinal.cardinalNumber,
        start: `${startDate}T${startTime}:00`,
        end: `${endDate}T${endTime}:00`,
        recurrenceType,
        recurrenceEndDate: hasRecurrence ? recurrenceEndDate : endDate,
      };
      onCreateSession?.(body);
    }
    // TODO: 일반 일정 API 연동 시 onCreateGeneral 콜백 추가
    handleClose();
  };

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
        <div className="scrollbar-custom max-h-[700px] overflow-y-auto px-[60px]">
          <h2 className="typo-h3 text-text-normal py-400">{`${SCHEDULE_TYPE_LABEL[activeTab]} 생성`}</h2>

          {isSession ? (
            <SessionScheduleForm
              title={title}
              onTitleChange={setTitle}
              startDate={startDate}
              startTime={startTime}
              endDate={endDate}
              endTime={endTime}
              onStartDateChange={setStartDate}
              onStartTimeChange={setStartTime}
              onEndDateChange={setEndDate}
              onEndTimeChange={setEndTime}
              location={location}
              onLocationChange={setLocation}
              content={content}
              onContentChange={setContent}
              selectedCardinalId={selectedCardinalId}
              onCardinalChange={setSelectedCardinalId}
              recurrenceType={recurrenceType}
              onRecurrenceTypeChange={setRecurrenceType}
              recurrenceEndDate={recurrenceEndDate}
              onRecurrenceEndDateChange={setRecurrenceEndDate}
              isRecurrenceEndValid={isRecurrenceEndValid}
            />
          ) : (
            <GeneralScheduleForm
              title={title}
              onTitleChange={setTitle}
              startDate={startDate}
              startTime={startTime}
              endDate={endDate}
              endTime={endTime}
              onStartDateChange={setStartDate}
              onStartTimeChange={setStartTime}
              onEndDateChange={setEndDate}
              onEndTimeChange={setEndTime}
              location={location}
              onLocationChange={setLocation}
              content={content}
              onContentChange={setContent}
            />
          )}
        </div>

        {/* Footer */}
        <div className="bg-container-neutral flex items-center justify-end gap-200 px-400 pt-400 pb-500">
          <Button variant="secondary" size="lg" onClick={handleClose}>
            취소
          </Button>
          <Button variant="primary" size="lg" disabled={!isValid} onClick={handleSubmit}>
            {isSession ? '세션 생성' : '저장'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { CreateScheduleModal, type CreateScheduleModalProps };
