'use client';

import Image from 'next/image';

import {
  CalendarPicker,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import { ArrowDownIcon } from '@/assets/icons';
import { ScheduleDateRangeFields } from '@/components/admin/schedule/general/ScheduleDateRangeFields';
import { ScheduleFormField } from '@/components/admin/schedule/general/ScheduleFormField';
import { ScheduleTextField } from '@/components/admin/schedule/general/ScheduleTextField';
import { ScheduleTextareaField } from '@/components/admin/schedule/general/ScheduleTextareaField';
import {
  SESSION_RECURRENCE_LABEL,
  SESSION_RECURRENCE_OPTIONS,
} from '@/constants/admin/session.constants';
import { addYearsToDateInput } from '@/utils/shared/date';
import type { Cardinal } from '@/types/admin/cardinal';

import { SessionInfoBanner } from '@/components/admin/schedule/session/SessionInfoBanner';

import type { ScheduleFormState, SessionFormState } from './types';

interface SessionScheduleFormProps {
  form: ScheduleFormState;
  onFormChange: (patch: Partial<ScheduleFormState>) => void;
  session: SessionFormState;
  onSessionChange: (patch: Partial<SessionFormState>) => void;
  isRecurrenceEndValid: boolean;
  cardinals: Cardinal[];
  selectedCardinal: Cardinal | null | undefined;
}

function SessionScheduleForm({
  form,
  onFormChange,
  session,
  onSessionChange,
  isRecurrenceEndValid,
  cardinals,
  selectedCardinal,
}: SessionScheduleFormProps) {
  const hasRecurrence = session.recurrenceType !== 'NONE';
  // 반복 종료는 일정 종료 일자 이후, 시작 일자 기준 1년 이내에서 선택 가능
  const recurrenceMinDate = form.endDate;
  const recurrenceMaxDate = addYearsToDateInput(form.startDate, 1);

  return (
    <div className="flex flex-col gap-400 py-400">
      {/* 안내 배너 */}
      <SessionInfoBanner />

      {/* 세션 제목 */}
      <ScheduleTextField
        label="세션 제목"
        value={form.title}
        onChange={(v) => onFormChange({ title: v })}
        placeholder="예 : 7기 정기 모임"
        maxLength={30}
      />

      {/* 기수 */}
      <ScheduleFormField label="기수">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="bg-container-neutral flex w-30 cursor-pointer items-center gap-100 rounded-sm py-200 pr-200 pl-300"
            >
              <span className="typo-button2 text-text-normal flex-1 text-left">
                {selectedCardinal ? `${selectedCardinal.cardinalNumber}기` : '선택'}
              </span>
              <Image src={ArrowDownIcon} alt="" width={20} height={20} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-30">
            {cardinals.length === 0 ? (
              <DropdownMenuItem disabled>기수 없음</DropdownMenuItem>
            ) : (
              cardinals.map((c) => (
                <DropdownMenuItem
                  key={c.id}
                  onSelect={() => onSessionChange({ selectedCardinalId: c.id })}
                >
                  {c.cardinalNumber}기
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </ScheduleFormField>

      {/* 시작 / 종료 일자 */}
      <ScheduleDateRangeFields form={form} onFormChange={onFormChange} />

      {/* 반복 설정 */}
      <ScheduleFormField label="반복 설정">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="bg-container-neutral flex w-30 cursor-pointer items-center gap-100 rounded-sm py-200 pr-200 pl-300"
            >
              <span className="typo-button2 text-text-normal flex-1 text-left">
                {SESSION_RECURRENCE_LABEL[session.recurrenceType]}
              </span>
              <Image src={ArrowDownIcon} alt="" width={20} height={20} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-30">
            {SESSION_RECURRENCE_OPTIONS.map((type) => (
              <DropdownMenuItem
                key={type}
                onSelect={() => onSessionChange({ recurrenceType: type })}
              >
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
              value={session.recurrenceEndDate}
              onChange={(v) => onSessionChange({ recurrenceEndDate: v })}
              minDate={recurrenceMinDate}
              maxDate={recurrenceMaxDate}
            />
            {!isRecurrenceEndValid && (
              <p className="typo-caption2 text-state-error pt-1">
                반복 종료 일자는 종료 일자 이후여야 합니다.
              </p>
            )}
          </div>
        </ScheduleFormField>
      )}

      {/* 모임 장소 */}
      <ScheduleTextField
        label="모임 장소 (선택)"
        value={form.location}
        onChange={(v) => onFormChange({ location: v })}
        placeholder="장소를 입력해주세요."
        maxLength={30}
      />

      {/* 일정 설명 */}
      <ScheduleTextareaField
        label="일정 설명 (선택)"
        value={form.content}
        onChange={(v) => onFormChange({ content: v })}
        placeholder="일정에 대한 설명을 입력해주세요."
        maxLength={500}
      />
    </div>
  );
}

export { SessionScheduleForm, type SessionScheduleFormProps };
