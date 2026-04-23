'use client';

import { useState } from 'react';

import { Button } from '@/components/ui';
import { ScheduleFormBody } from '@/components/admin/schedule/modal/ScheduleFormBody';
import { useCreateSchedule } from '@/hooks/queries/admin/useAdminScheduleQueries';
import { toDateInputValue } from '@/utils/shared/date';
import {
  isScheduleContentValid,
  isScheduleLocationValid,
  isScheduleTitleValid,
} from '@/utils/admin/scheduleFormUtils';

import { isDateRangeValid, type ScheduleFormState } from './types';

const INITIAL_FORM: ScheduleFormState = {
  title: '',
  startDate: toDateInputValue(),
  startTime: '00:00',
  endDate: toDateInputValue(),
  endTime: '23:55',
  location: '',
  content: '',
};

interface CreateGeneralScheduleFormProps {
  cardinalNumber: number | null;
  onClose: () => void;
}

function CreateGeneralScheduleForm({ cardinalNumber, onClose }: CreateGeneralScheduleFormProps) {
  const [form, setForm] = useState<ScheduleFormState>(INITIAL_FORM);
  const { mutate, isPending } = useCreateSchedule();

  const updateForm = (patch: Partial<ScheduleFormState>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const isValid =
    isScheduleTitleValid(form.title) &&
    isScheduleLocationValid(form.location) &&
    isScheduleContentValid(form.content) &&
    isDateRangeValid(form) &&
    cardinalNumber !== null;

  const handleSubmit = () => {
    if (!isValid || cardinalNumber === null) return;
    mutate(
      {
        title: form.title,
        content: form.content,
        location: form.location,
        cardinal: cardinalNumber,
        start: `${form.startDate}T${form.startTime}:00`,
        end: `${form.endDate}T${form.endTime}:00`,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <>
      <div className="scrollbar-custom max-h-[700px] overflow-y-auto px-[60px]">
        <h2 className="typo-h3 text-text-normal py-400">일정 생성</h2>
        <ScheduleFormBody
          form={form}
          onFormChange={updateForm}
          titleLabel="일정 제목"
          titlePlaceholder="예 : 중간고사 기간"
        />
      </div>

      <div className="bg-container-neutral flex items-center justify-end gap-200 px-400 pt-400 pb-500">
        <Button variant="secondary" size="lg" onClick={onClose}>
          취소
        </Button>
        <Button variant="primary" size="lg" disabled={!isValid || isPending} onClick={handleSubmit}>
          저장
        </Button>
      </div>
    </>
  );
}

export { CreateGeneralScheduleForm, type CreateGeneralScheduleFormProps };
