'use client';

import { useState } from 'react';

import { Button } from '@/components/ui';
import { SessionScheduleForm } from '@/components/admin/schedule/modal/SessionScheduleForm';
import { useCardinals } from '@/hooks/queries';
import { addYearsToDateInput, toDateInputValue } from '@/utils/shared/date';
import type { CreateSessionBody } from '@/types/admin/session';

import { isScheduleTitleValid } from '@/utils/admin/scheduleFormUtils';

import { SCHEDULE_MODAL_FOOTER_CLASS } from './constants';
import { isDateRangeValid, type ScheduleFormState, type SessionFormState } from './types';

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

interface CreateSessionScheduleFormProps {
  onCreateSession?: (body: CreateSessionBody) => void;
  onClose: () => void;
}

function CreateSessionScheduleForm({ onCreateSession, onClose }: CreateSessionScheduleFormProps) {
  const [form, setForm] = useState<ScheduleFormState>(INITIAL_FORM);
  const [session, setSession] = useState<SessionFormState>(INITIAL_SESSION);

  const { data: cardinals = [] } = useCardinals();
  const selectedCardinal =
    session.selectedCardinalId !== null
      ? cardinals.find((c) => c.id === session.selectedCardinalId)
      : null;

  const hasRecurrence = session.recurrenceType !== 'NONE';
  const isRecurrenceEndValid = !hasRecurrence || session.recurrenceEndDate >= form.endDate;

  // recurrenceEndDate를 [endDate, startDate+1년] 범위 안으로 clamp
  const clampRecurrenceEndDate = (startDate: string, endDate: string) => {
    const minDate = endDate;
    const maxDate = addYearsToDateInput(startDate, 1);
    setSession((prev) => {
      if (prev.recurrenceEndDate < minDate) {
        return { ...prev, recurrenceEndDate: minDate };
      }
      if (prev.recurrenceEndDate > maxDate) {
        return { ...prev, recurrenceEndDate: maxDate };
      }
      return prev;
    });
  };

  const updateForm = (patch: Partial<ScheduleFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));

    // 시작/종료 일자 변경으로 반복 종료 유효 범위가 바뀌면 기존 값을 범위 내로 clamp
    if (hasRecurrence && (patch.startDate !== undefined || patch.endDate !== undefined)) {
      clampRecurrenceEndDate(patch.startDate ?? form.startDate, patch.endDate ?? form.endDate);
    }
  };

  const updateSession = (patch: Partial<SessionFormState>) => {
    setSession((prev) => ({ ...prev, ...patch }));

    // 반복 설정이 '안 함' → 반복으로 바뀌는 순간에도 clamp 필요
    if (patch.recurrenceType && patch.recurrenceType !== 'NONE') {
      clampRecurrenceEndDate(form.startDate, form.endDate);
    }
  };

  const isValid =
    isScheduleTitleValid(form.title) &&
    selectedCardinal != null &&
    isDateRangeValid(form) &&
    isRecurrenceEndValid;

  const handleSubmit = () => {
    if (!isValid || !selectedCardinal) return;

    const body: CreateSessionBody = {
      title: form.title.trim(),
      content: form.content.trim(),
      location: form.location.trim(),
      cardinal: selectedCardinal.cardinalNumber,
      start: `${form.startDate}T${form.startTime}:00`,
      end: `${form.endDate}T${form.endTime}:00`,
      recurrenceType: hasRecurrence ? session.recurrenceType : null,
      recurrenceEndDate: hasRecurrence ? session.recurrenceEndDate : null,
    };
    onCreateSession?.(body);
    onClose();
  };

  return (
    <>
      <div className="scrollbar-custom tablet:px-15 max-h-175 min-h-0 overflow-y-auto px-400">
        <h2 className="typo-h3 text-text-normal py-400">세션 생성</h2>
        <SessionScheduleForm
          form={form}
          onFormChange={updateForm}
          session={session}
          onSessionChange={updateSession}
          isRecurrenceEndValid={isRecurrenceEndValid}
          cardinals={cardinals}
          selectedCardinal={selectedCardinal}
        />
      </div>

      <div className={SCHEDULE_MODAL_FOOTER_CLASS}>
        <Button variant="secondary" size="lg" onClick={onClose}>
          취소
        </Button>
        <Button variant="primary" size="lg" disabled={!isValid} onClick={handleSubmit}>
          세션 생성
        </Button>
      </div>
    </>
  );
}

export { CreateSessionScheduleForm, type CreateSessionScheduleFormProps };
