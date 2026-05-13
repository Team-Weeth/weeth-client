import { DateTimeInput } from '@/components/ui';

import { isDateRangeValid } from '../modal/types';
import type { ScheduleFormState } from '../modal/types';

interface ScheduleDateRangeFieldsProps {
  form: ScheduleFormState;
  onFormChange: (patch: Partial<ScheduleFormState>) => void;
}

function ScheduleDateRangeFields({ form, onFormChange }: ScheduleDateRangeFieldsProps) {
  return (
    <div className="flex flex-col gap-100">
      <div className="flex flex-col gap-600 tablet:flex-row">
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
      {!isDateRangeValid(form) && (
        <span className="typo-caption2 text-state-error px-400 pt-200">
          종료 일시는 시작 일시보다 이후여야 합니다.
        </span>
      )}
    </div>
  );
}

export { ScheduleDateRangeFields, type ScheduleDateRangeFieldsProps };
