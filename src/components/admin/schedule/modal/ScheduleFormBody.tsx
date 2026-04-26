import { DateTimeInput } from '@/components/ui';
import { ScheduleTextField } from '@/components/admin/schedule/general/ScheduleTextField';
import { ScheduleTextareaField } from '@/components/admin/schedule/general/ScheduleTextareaField';
import { SCHEDULE_FIELD_LIMITS } from '@/utils/admin/scheduleFormUtils';

import { isDateRangeValid } from './types';
import type { ScheduleFormState } from './types';

interface ScheduleFormBodyProps {
  form: ScheduleFormState;
  onFormChange: (patch: Partial<ScheduleFormState>) => void;
  titleLabel: string;
  titlePlaceholder: string;
}

function ScheduleFormBody({
  form,
  onFormChange,
  titleLabel,
  titlePlaceholder,
}: ScheduleFormBodyProps) {
  return (
    <div className="flex flex-col gap-400 py-400">
      <ScheduleTextField
        label={titleLabel}
        value={form.title}
        onChange={(v) => onFormChange({ title: v })}
        placeholder={titlePlaceholder}
        maxLength={SCHEDULE_FIELD_LIMITS.title}
      />

      <div className="flex flex-col gap-100">
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
        {!isDateRangeValid(form) && (
          <span className="typo-caption2 text-state-error px-400 pt-200">
            종료 일시는 시작 일시보다 이후여야 합니다.
          </span>
        )}
      </div>

      <ScheduleTextField
        label="모임 장소 (선택)"
        value={form.location}
        onChange={(v) => onFormChange({ location: v })}
        placeholder="장소를 입력해주세요."
        maxLength={SCHEDULE_FIELD_LIMITS.location}
      />

      <ScheduleTextareaField
        label="일정 설명 (선택)"
        value={form.content}
        onChange={(v) => onFormChange({ content: v })}
        placeholder="일정에 대한 설명을 입력해주세요."
        maxLength={SCHEDULE_FIELD_LIMITS.content}
      />
    </div>
  );
}

export { ScheduleFormBody, type ScheduleFormBodyProps };
