'use client';

import { useState } from 'react';
import Image from 'next/image';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { CalendarPicker } from '@/components/ui/CalendarPicker';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ArrowDownIcon, InfoCircleIcon } from '@/assets/icons';
import { AdminCloseIcon } from '@/assets/icons/admin';
import { ScheduleFormField } from '@/components/admin/schedule/ScheduleFormField';
import { DateTimeInput } from '@/components/ui/DateTimeInput';
import { SCHEDULE_TYPE_LABEL } from '@/constants/admin/schedule.constants';
import {
  SESSION_RECURRENCE_LABEL,
  SESSION_RECURRENCE_OPTIONS,
} from '@/constants/admin/session.constants';
import { useCardinals } from '@/hooks/queries';
import type { ScheduleType } from '@/types/admin/schedule';
import type { CreateSessionBody, SessionRecurrenceType } from '@/types/admin/session';
import { addYearsToDateInput, toDateInputValue } from '@/utils/shared/date';

interface CreateScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardinalNumber: number | null;
  /** 모달이 열릴 때 활성화할 탭 (기본값: GENERAL) */
  initialTab?: ScheduleType;
  /** 세션 탭에서 저장 시 호출. API 연결 전까지 목업 */
  onCreateSession?: (body: CreateSessionBody) => void;
}

function CreateScheduleModal({
  open,
  onOpenChange,
  cardinalNumber,
  initialTab = 'GENERAL',
  onCreateSession,
}: CreateScheduleModalProps) {
  const [activeTab, setActiveTab] = useState<ScheduleType>(initialTab);
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(toDateInputValue());
  const [startTime, setStartTime] = useState('00:00');
  const [endDate, setEndDate] = useState(toDateInputValue());
  const [endTime, setEndTime] = useState('23:55');
  const [location, setLocation] = useState('');
  const [content, setContent] = useState('');

  // 세션 탭 전용 state
  const { data: cardinals = [] } = useCardinals();
  const [selectedCardinalId, setSelectedCardinalId] = useState<number | null>(null);
  const [recurrenceType, setRecurrenceType] = useState<SessionRecurrenceType>('NONE');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(toDateInputValue());

  const selectedCardinal =
    selectedCardinalId !== null ? cardinals.find((c) => c.id === selectedCardinalId) : null;

  const resetForm = () => {
    setActiveTab(initialTab);
    setTitle('');
    setStartDate(toDateInputValue());
    setStartTime('00:00');
    setEndDate(toDateInputValue());
    setEndTime('23:59');
    setLocation('');
    setContent('');
    setSelectedCardinalId(null);
    setRecurrenceType('NONE');
    setRecurrenceEndDate(toDateInputValue());
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const isSession = activeTab === 'SESSION';
  const isDateRangeValid = startDate < endDate;
  const hasRecurrence = recurrenceType !== 'NONE';
  // 반복 종료 일자가 일정 종료 일자보다 앞서 있으면 무효
  const isRecurrenceEndValid = !hasRecurrence || recurrenceEndDate >= endDate;

  const isValid = isSession
    ? title.trim().length > 0 &&
      selectedCardinal !== null &&
      selectedCardinal !== undefined &&
      isDateRangeValid &&
      isRecurrenceEndValid
    : title.trim().length > 0 && isDateRangeValid && cardinalNumber !== null;

  const handleSubmit = () => {
    if (!isValid) return;

    if (isSession && selectedCardinal) {
      const body: CreateSessionBody = {
        title: title.trim(),
        content: content.trim(),
        location: location.trim(),
        cardinal: selectedCardinal.cardinalNumber,
        start: `${startDate}T${startTime}:00`,
        end: `${endDate}T${endTime}:00`,
        recurrenceType,
        recurrenceEndDate: hasRecurrence ? recurrenceEndDate : endDate,
      };
      onCreateSession?.(body);
    }
    // TODO: 일반 일정 API 연동 시 onCreateGeneral 콜백 추가
    handleClose();
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) resetForm();
  };

  // 반복 종료 캘린더: 시작일자 ~ 시작일자 + 1년 내에서 선택 가능
  const recurrenceMinDate = startDate;
  const recurrenceMaxDate = addYearsToDateInput(startDate, 1);

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        className="bg-background flex w-215 max-w-[860px] flex-col gap-0 overflow-hidden rounded-lg p-0"
        showCloseButton={false}
      >
        {/* Header with tabs */}
        <div className="flex items-start justify-between px-700 pt-700">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as ScheduleType)}
            className="gap-0"
          >
            <TabsList variant="line" className="h-8">
              <TabsTrigger value="GENERAL">{SCHEDULE_TYPE_LABEL.GENERAL}</TabsTrigger>
              <TabsTrigger value="SESSION">{SCHEDULE_TYPE_LABEL.SESSION}</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="hidden" />
          </Tabs>
          <button
            type="button"
            onClick={handleClose}
            className="flex cursor-pointer items-center justify-center rounded-sm p-200"
            aria-label="닫기"
          >
            <Icon src={AdminCloseIcon} size={24} alt="닫기" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="scrollbar-custom max-h-[700px] overflow-y-auto px-700">
          <h2 className="typo-h3 text-text-normal py-400">{`${SCHEDULE_TYPE_LABEL[activeTab]} 생성`}</h2>

          {/* 세션 탭 안내 배너 */}
          {isSession && (
            <div className="bg-container-neutral-alternative mb-400 flex items-start gap-200 rounded-md p-300">
              <Icon src={InfoCircleIcon} size={20} className="text-icon-alternative mt-[2px]" />
              <p className="typo-body2 text-text-alternative flex-1">
                세션은 출석을 진행할 동아리의 공식적인 모임을 관리합니다. 생성된 세션은 출석 관리에
                자동으로 연결되며, 출석 내역 확인 및 수정은 출석 관리 탭에서 진행해주세요.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-400 py-400">
            {/* Title */}
            <ScheduleFormField label={isSession ? '세션 제목' : '일정 제목'}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isSession ? '예 : 7기 정기 모임' : '예 : 중간고사 기간'}
                className="bg-container-neutral typo-body1 placeholder:text-text-alternative h-12 w-full rounded-sm px-400 py-300 focus:outline-none"
              />
            </ScheduleFormField>

            {/* Cardinal (세션 탭 전용) */}
            {isSession && (
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
                        <DropdownMenuItem key={c.id} onSelect={() => setSelectedCardinalId(c.id)}>
                          {c.cardinalNumber}기
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </ScheduleFormField>
            )}

            {/* Start / End dates */}
            <div className="flex gap-600">
              <DateTimeInput
                label="시작 일자"
                dateValue={startDate}
                timeValue={startTime}
                onDateChange={setStartDate}
                onTimeChange={setStartTime}
              />
              <DateTimeInput
                label="종료 일자"
                dateValue={endDate}
                timeValue={endTime}
                onDateChange={setEndDate}
                onTimeChange={setEndTime}
              />
            </div>

            {/* Recurrence (세션 탭 전용) */}
            {isSession && (
              <>
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
                        <DropdownMenuItem key={type} onSelect={() => setRecurrenceType(type)}>
                          {SESSION_RECURRENCE_LABEL[type]}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </ScheduleFormField>

                {hasRecurrence && (
                  <ScheduleFormField label="반복 종료">
                    <div className="flex flex-col gap-100">
                      <CalendarPicker
                        value={recurrenceEndDate}
                        onChange={setRecurrenceEndDate}
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
              </>
            )}

            {/* Location */}
            <ScheduleFormField label="모임 장소 (선택)">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="장소를 입력해주세요."
                className="bg-container-neutral typo-body1 placeholder:text-text-alternative h-12 w-full rounded-sm px-400 py-300 focus:outline-none"
              />
            </ScheduleFormField>

            {/* Content */}
            <ScheduleFormField label="일정 설명 (선택)">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="일정에 대한 설명을 입력해주세요."
                className="bg-container-neutral typo-body1 placeholder:text-text-alternative h-[150px] w-full resize-none rounded-sm px-400 py-300 focus:outline-none"
              />
            </ScheduleFormField>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-container-neutral flex items-center justify-end gap-200 px-400 pt-400 pb-500">
          <Button variant="secondary" size="lg" onClick={handleClose}>
            취소
          </Button>
          <Button variant="primary" size="lg" disabled={!isValid} onClick={handleSubmit}>
            {isSession ? '세션 생성' : '저장'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { CreateScheduleModal, type CreateScheduleModalProps };
