'use client';

import { useState } from 'react';

import { Button } from '@/components/ui';
import { SessionScheduleForm } from '@/components/admin/schedule/modal/SessionScheduleForm';
import { useCardinals } from '@/hooks/queries';
import { toDateInputValue } from '@/utils/shared/date';
import type { CreateSessionBody } from '@/types/admin/session';

import {
  isDateRangeValid,
  type ScheduleFormState,
  type SessionFormState,
} from './types';

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

function CreateSessionScheduleForm({
  onCreateSession,
  onClose,
}: CreateSessionScheduleFormProps) {
  const [form, setForm] = useState<ScheduleFormState>(INITIAL_FORM);
  const [session, setSession] = useState<SessionFormState>(INITIAL_SESSION);

  const { data: cardinals = [] } = useCardinals();
  const selectedCardinal =
    session.selectedCardinalId !== null
      ? cardinals.find((c) => c.id === session.selectedCardinalId)
      : null;

  const updateForm = (patch: Partial<ScheduleFormState>) =>
    setForm((prev) => ({ ...prev, ...patch }));
  const updateSession = (patch: Partial<SessionFormState>) =>
    setSession((prev) => ({ ...prev, ...patch }));

  const hasRecurrence = session.recurrenceType !== 'NONE';
  const isRecurrenceEndValid = !hasRecurrence || session.recurrenceEndDate >= form.endDate;

  const isValid =
    form.title.trim().length > 0 &&
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
      recurrenceType: session.recurrenceType,
      recurrenceEndDate: hasRecurrence ? session.recurrenceEndDate : form.endDate,
    };
    onCreateSession?.(body);
    onClose();
  };

  return (
    <>
      <div className="scrollbar-custom max-h-[700px] overflow-y-auto px-[60px]">
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

      <div className="bg-container-neutral flex items-center justify-end gap-200 px-400 pt-400 pb-500">
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
