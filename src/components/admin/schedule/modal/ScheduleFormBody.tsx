import { ScheduleFormField } from '@/components/admin/schedule/ScheduleFormField';
import { DateTimeInput } from '@/components/ui/DateTimeInput';

import type { ScheduleFormState } from './types';

interface ScheduleFormBodyProps {
  form: ScheduleFormState;
  onFormChange: (patch: Partial<ScheduleFormState>) => void;
  titleLabel: string;
  titlePlaceholder: string;
}

const INPUT_CLASS =
  'bg-container-neutral typo-body1 placeholder:text-text-alternative text-text-normal h-12 w-full rounded-sm px-400 py-300 focus:outline-none';

function ScheduleFormBody({
  form,
  onFormChange,
  titleLabel,
  titlePlaceholder,
}: ScheduleFormBodyProps) {
  return (
    <div className="flex flex-col gap-400 py-400">
      <ScheduleFormField label={titleLabel}>
        <input
          type="text"
          value={form.title}
          onChange={(e) => onFormChange({ title: e.target.value })}
          placeholder={titlePlaceholder}
          className={INPUT_CLASS}
        />
      </ScheduleFormField>

      <div className="flex gap-600">
        <DateTimeInput
          label="시작 일자"
          dateValue={form.startDate}
          timeValue={form.startTime}
          onDateChange={(v) => onFormChange({ startDate: v })}
          onTimeChange={(v) => onFormChange({ startTime: v })}
        />
        <DateTimeInput
          label="종료 일자"
          dateValue={form.endDate}
          timeValue={form.endTime}
          onDateChange={(v) => onFormChange({ endDate: v })}
          onTimeChange={(v) => onFormChange({ endTime: v })}
        />
      </div>

      <ScheduleFormField label="모임 장소 (선택)">
        <input
          type="text"
          value={form.location}
          onChange={(e) => onFormChange({ location: e.target.value })}
          placeholder="장소를 입력해주세요."
          className={INPUT_CLASS}
        />
      </ScheduleFormField>

      <ScheduleFormField label="일정 설명 (선택)">
        <textarea
          value={form.content}
          onChange={(e) => onFormChange({ content: e.target.value })}
          placeholder="일정에 대한 설명을 입력해주세요."
          className="bg-container-neutral typo-body1 placeholder:text-text-alternative text-text-normal h-[150px] w-full resize-none rounded-sm px-400 py-300 focus:outline-none"
        />
      </ScheduleFormField>
    </div>
  );
}

export { ScheduleFormBody, type ScheduleFormBodyProps };
