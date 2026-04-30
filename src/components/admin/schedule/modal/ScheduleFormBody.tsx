import { ScheduleDateRangeFields } from '@/components/admin/schedule/general/ScheduleDateRangeFields';
import { ScheduleTextField } from '@/components/admin/schedule/general/ScheduleTextField';
import { ScheduleTextareaField } from '@/components/admin/schedule/general/ScheduleTextareaField';
import { SCHEDULE_FIELD_LIMITS } from '@/utils/admin/scheduleFormUtils';

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

      <ScheduleDateRangeFields form={form} onFormChange={onFormChange} />

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
