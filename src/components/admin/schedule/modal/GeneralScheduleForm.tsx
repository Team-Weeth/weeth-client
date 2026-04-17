import { ScheduleFormField } from '@/components/admin/schedule/ScheduleFormField';
import { DateTimeInput } from '@/components/ui/DateTimeInput';

interface GeneralScheduleFormProps {
  title: string;
  onTitleChange: (value: string) => void;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  onStartDateChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  location: string;
  onLocationChange: (value: string) => void;
  content: string;
  onContentChange: (value: string) => void;
}

function GeneralScheduleForm({
  title,
  onTitleChange,
  startDate,
  startTime,
  endDate,
  endTime,
  onStartDateChange,
  onStartTimeChange,
  onEndDateChange,
  onEndTimeChange,
  location,
  onLocationChange,
  content,
  onContentChange,
}: GeneralScheduleFormProps) {
  return (
    <div className="flex flex-col gap-400 py-400">
      <ScheduleFormField label="일정 제목">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="예 : 중간고사 기간"
          className="bg-container-neutral typo-body1 placeholder:text-text-alternative h-12 w-full rounded-sm px-400 py-300 focus:outline-none"
        />
      </ScheduleFormField>

      <div className="flex gap-600">
        <DateTimeInput
          label="시작 일자"
          dateValue={startDate}
          timeValue={startTime}
          onDateChange={onStartDateChange}
          onTimeChange={onStartTimeChange}
        />
        <DateTimeInput
          label="종료 일자"
          dateValue={endDate}
          timeValue={endTime}
          onDateChange={onEndDateChange}
          onTimeChange={onEndTimeChange}
        />
      </div>

      <ScheduleFormField label="모임 장소 (선택)">
        <input
          type="text"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          placeholder="장소를 입력해주세요."
          className="bg-container-neutral typo-body1 placeholder:text-text-alternative h-12 w-full rounded-sm px-400 py-300 focus:outline-none"
        />
      </ScheduleFormField>

      <ScheduleFormField label="일정 설명 (선택)">
        <textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="일정에 대한 설명을 입력해주세요."
          className="bg-container-neutral typo-body1 placeholder:text-text-alternative h-[150px] w-full resize-none rounded-sm px-400 py-300 focus:outline-none"
        />
      </ScheduleFormField>
    </div>
  );
}

export { GeneralScheduleForm, type GeneralScheduleFormProps };
