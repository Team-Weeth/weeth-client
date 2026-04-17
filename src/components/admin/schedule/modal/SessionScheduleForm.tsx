'use client';

import Image from 'next/image';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
} from '@/components/ui';
import { CalendarPicker } from '@/components/ui/CalendarPicker';
import { DateTimeInput } from '@/components/ui/DateTimeInput';
import { ArrowDownIcon, InfoCircleIcon } from '@/assets/icons';
import { ScheduleFormField } from '@/components/admin/schedule/ScheduleFormField';
import {
  SESSION_RECURRENCE_LABEL,
  SESSION_RECURRENCE_OPTIONS,
} from '@/constants/admin/session.constants';
import { useCardinals } from '@/hooks/queries';
import type { SessionRecurrenceType } from '@/types/admin/session';
import { addYearsToDateInput } from '@/utils/shared/date';

interface SessionScheduleFormProps {
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
  selectedCardinalId: number | null;
  onCardinalChange: (id: number) => void;
  recurrenceType: SessionRecurrenceType;
  onRecurrenceTypeChange: (type: SessionRecurrenceType) => void;
  recurrenceEndDate: string;
  onRecurrenceEndDateChange: (value: string) => void;
  isRecurrenceEndValid: boolean;
}

function SessionScheduleForm({
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
  selectedCardinalId,
  onCardinalChange,
  recurrenceType,
  onRecurrenceTypeChange,
  recurrenceEndDate,
  onRecurrenceEndDateChange,
  isRecurrenceEndValid,
}: SessionScheduleFormProps) {
  const { data: cardinals = [] } = useCardinals();
  const selectedCardinal =
    selectedCardinalId !== null ? cardinals.find((c) => c.id === selectedCardinalId) : null;

  const hasRecurrence = recurrenceType !== 'NONE';
  const recurrenceMinDate = startDate;
  const recurrenceMaxDate = addYearsToDateInput(startDate, 1);

  return (
    <div className="flex flex-col gap-400 py-400">
      {/* 안내 배너 */}
      <div className="bg-container-neutral-alternative flex items-start gap-200 rounded-md p-300">
        <Icon src={InfoCircleIcon} size={20} className="text-icon-alternative mt-[2px]" />
        <p className="typo-body2 text-text-alternative flex-1">
          세션은 출석을 진행할 동아리의 공식적인 모임을 관리합니다. 생성된 세션은 출석 관리에
          자동으로 연결되며, 출석 내역 확인 및 수정은 출석 관리 탭에서 진행해주세요.
        </p>
      </div>

      {/* 세션 제목 */}
      <ScheduleFormField label="세션 제목">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="예 : 7기 정기 모임"
          className="bg-container-neutral typo-body1 placeholder:text-text-alternative h-12 w-full rounded-sm px-400 py-300 focus:outline-none"
        />
      </ScheduleFormField>

      {/* 기수 */}
      <ScheduleFormField label="기수">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="bg-container-neutral flex w-[120px] cursor-pointer items-center gap-100 rounded-sm py-200 pr-200 pl-300"
            >
              <span className="typo-button2 text-text-normal flex-1 text-left">
                {selectedCardinal ? `${selectedCardinal.cardinalNumber}기` : '선택'}
              </span>
              <Image src={ArrowDownIcon} alt="" width={20} height={20} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[120px]">
            {cardinals.length === 0 ? (
              <DropdownMenuItem disabled>기수 없음</DropdownMenuItem>
            ) : (
              cardinals.map((c) => (
                <DropdownMenuItem key={c.id} onSelect={() => onCardinalChange(c.id)}>
                  {c.cardinalNumber}기
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </ScheduleFormField>

      {/* 시작 / 종료 일자 */}
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

      {/* 반복 설정 */}
      <ScheduleFormField label="반복 설정">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="bg-container-neutral flex w-[120px] cursor-pointer items-center gap-100 rounded-sm py-200 pr-200 pl-300"
            >
              <span className="typo-button2 text-text-normal flex-1 text-left">
                {SESSION_RECURRENCE_LABEL[recurrenceType]}
              </span>
              <Image src={ArrowDownIcon} alt="" width={20} height={20} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[120px]">
            {SESSION_RECURRENCE_OPTIONS.map((type) => (
              <DropdownMenuItem key={type} onSelect={() => onRecurrenceTypeChange(type)}>
                {SESSION_RECURRENCE_LABEL[type]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </ScheduleFormField>

      {/* 반복 종료 */}
      {hasRecurrence && (
        <ScheduleFormField label="반복 종료">
          <div className="flex flex-col gap-100">
            <CalendarPicker
              value={recurrenceEndDate}
              onChange={onRecurrenceEndDateChange}
              minDate={recurrenceMinDate}
              maxDate={recurrenceMaxDate}
            />
            {!isRecurrenceEndValid && (
              <p className="typo-caption2 text-state-error px-400">
                반복 종료 일자는 종료 일자 이후여야 합니다.
              </p>
            )}
          </div>
        </ScheduleFormField>
      )}

      {/* 모임 장소 */}
      <ScheduleFormField label="모임 장소 (선택)">
        <input
          type="text"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          placeholder="장소를 입력해주세요."
          className="bg-container-neutral typo-body1 placeholder:text-text-alternative h-12 w-full rounded-sm px-400 py-300 focus:outline-none"
        />
      </ScheduleFormField>

      {/* 일정 설명 */}
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

export { SessionScheduleForm, type SessionScheduleFormProps };
