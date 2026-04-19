'use client';

import { useState } from 'react';

import { Button, Icon, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AdminCloseIcon } from '@/assets/icons/admin';
import { ScheduleFormBody } from '@/components/admin/schedule/modal/ScheduleFormBody';
import { SessionScheduleForm } from '@/components/admin/schedule/modal/SessionScheduleForm';
import { SCHEDULE_TYPE_LABEL } from '@/constants/admin/schedule.constants';
import { useCardinals } from '@/hooks/queries';
import type { ScheduleType } from '@/types/admin/schedule';
import type { CreateSessionBody } from '@/types/admin/session';
import { toDateInputValue } from '@/utils/shared/date';

import type { ScheduleFormState, SessionFormState } from './types';

interface CreateScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardinalNumber: number | null;
  /** 모달이 열릴 때 활성화할 탭 (기본값: GENERAL) */
  initialTab?: ScheduleType;
  /** 세션 탭에서 저장 시 호출. API 연결 전까지 목업 */
  onCreateSession?: (body: CreateSessionBody) => void;
}

const INITIAL_FORM: ScheduleFormState = {
  title: '',
  startDate: toDateInputValue(),
  startTime: '00:00',
  endDate: toDateInputValue(),
  endTime: '23:55',
  location: '',
  content: '',
};

const INITIAL_SESSION: SessionFormState = {
  selectedCardinalId: null,
  recurrenceType: 'NONE',
  recurrenceEndDate: toDateInputValue(),
};

function CreateScheduleModal({
  open,
  onOpenChange,
  cardinalNumber,
  initialTab = 'GENERAL',
  onCreateSession,
}: CreateScheduleModalProps) {
  const [activeTab, setActiveTab] = useState<ScheduleType>(initialTab);
  const [form, setForm] = useState<ScheduleFormState>(INITIAL_FORM);
  const [session, setSession] = useState<SessionFormState>(INITIAL_SESSION);

  const { data: cardinals = [] } = useCardinals();
  const selectedCardinal =
    session.selectedCardinalId !== null
      ? cardinals.find((c) => c.id === session.selectedCardinalId)
      : null;

  const updateForm = (patch: Partial<ScheduleFormState>) => setForm((prev) => ({ ...prev, ...patch }));
  const updateSession = (patch: Partial<SessionFormState>) => setSession((prev) => ({ ...prev, ...patch }));

  const resetForm = () => {
    setActiveTab(initialTab);
    setForm({ ...INITIAL_FORM, startDate: toDateInputValue(), endDate: toDateInputValue() });
    setSession({ ...INITIAL_SESSION, recurrenceEndDate: toDateInputValue() });
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const isSession = activeTab === 'SESSION';
  const isDateRangeValid = form.startDate < form.endDate;
  const hasRecurrence = session.recurrenceType !== 'NONE';
  const isRecurrenceEndValid = !hasRecurrence || session.recurrenceEndDate >= form.endDate;

  const isValid = isSession
    ? form.title.trim().length > 0 &&
      selectedCardinal !== null &&
      selectedCardinal !== undefined &&
      isDateRangeValid &&
      isRecurrenceEndValid
    : form.title.trim().length > 0 && isDateRangeValid && cardinalNumber !== null;

  const handleSubmit = () => {
    if (!isValid) return;

    if (isSession && selectedCardinal) {
      const body: CreateSessionBody = {
        title: form.title.trim(),
        content: form.content.trim(),
        location: form.location.trim(),
        cardinal: selectedCardinal.cardinalNumber,
        start: `${form.startDate}T${form.startTime}:00`,
        end: `${form.endDate}T${form.endTime}:00`,
        recurrenceType: session.recurrenceType,
        recurrenceEndDate: hasRecurrence ? session.recurrenceEndDate : form.endDate,
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
              form={form}
              onFormChange={updateForm}
              session={session}
              onSessionChange={updateSession}
              isRecurrenceEndValid={isRecurrenceEndValid}
            />
          ) : (
            <ScheduleFormBody
              form={form}
              onFormChange={updateForm}
              titleLabel="일정 제목"
              titlePlaceholder="예 : 중간고사 기간"
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
