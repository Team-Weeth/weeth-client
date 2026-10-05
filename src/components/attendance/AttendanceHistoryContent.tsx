'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { CardinalDropdown } from '@/components/common/CardinalDropdown';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Divider } from '@/components/ui/Divider';
import { Tag } from '@/components/ui/tag';
import { useAttendanceDetailQuery } from '@/hooks/attendance/useAttendanceDetailQuery';
import { useCardinalSelector } from '@/hooks/useCardinalSelector';
import { cn } from '@/lib/cn';
import { formatKoreanDate, formatTime } from '@/lib/formatTime';
import { USER_ATTENDANCE_STATUS_CONFIG } from '@/constants/attendance';
import { toastError } from '@/stores/useToastStore';
import type { AttendanceSummary } from '@/types/attendance';
import { AttendanceHistorySkeleton } from './AttendanceHistorySkeleton';
import { StatBox } from './StatBox';

function toDisplayRecord(record: AttendanceSummary['attendances'][number]) {
  const startDate = new Date(record.start);
  const endDate = new Date(record.end);
  const statusConfig = USER_ATTENDANCE_STATUS_CONFIG[record.status];

  return {
    id: record.id,
    title: record.title,
    location: record.location,
    statusLabel: statusConfig.label,
    statusClassName: statusConfig.className,
    date: `${formatKoreanDate(startDate)} (${formatTime(startDate)}~${formatTime(endDate)})`,
  };
}

function AttendanceHistoryContent() {
  const { clubId } = useParams<{ clubId: string }>();
  const {
    cardinals,
    activeCardinal,
    setSelectedCardinalId,
    isLoading: isCardinalLoading,
  } = useCardinalSelector({ autoSelectLatest: true, scope: 'attendance' });

  const {
    data: summary,
    isPending,
    isError,
  } = useAttendanceDetailQuery(activeCardinal?.cardinalNumber);

  useEffect(() => {
    if (isError) toastError('출석 기록을 불러오지 못했습니다.');
  }, [isError]);

  const { total, attendanceCount, absenceCount, attendances = [] } = summary ?? {};
  const records = attendances.map(toDisplayRecord);

  // 기수를 아직 모르면 조회 자체를 하지 않으므로, 기수 로딩도 로딩 상태로 함께 본다.
  const isLoading = isCardinalLoading || (cardinals.length > 0 && isPending && !isError);

  return (
    <div className="mx-auto flex w-full max-w-[1025px] flex-col gap-700 px-450 pt-600">
      <div className="flex flex-col items-start gap-200 self-stretch">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={`/${clubId}/attendance`}
                  className="typo-caption1 text-text-alternative"
                >
                  출석
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="typo-caption1 text-text-alternative">
                출석 기록
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex w-full items-center justify-between gap-400">
          <h1 className="typo-h2 text-text-normal text-pretty">출석 기록</h1>
          <CardinalDropdown
            cardinals={cardinals}
            activeCardinal={activeCardinal}
            onSelect={setSelectedCardinalId}
            disabled={isCardinalLoading || cardinals.length === 0}
          />
        </div>
      </div>

      {isLoading ? (
        <AttendanceHistorySkeleton />
      ) : isError ? (
        <p className="typo-body2 text-text-alternative py-400 text-center">
          출석 정보를 불러올 수 없습니다.
        </p>
      ) : (
        <div className="bg-container-neutral flex flex-col gap-400 rounded-lg p-400">
          <div className="flex gap-200">
            <StatBox label="세션" value={`${total ?? 0}회`} />
            <StatBox label="출석" value={`${attendanceCount ?? 0}회`} />
            <StatBox label="결석" value={`${absenceCount ?? 0}회`} />
          </div>

          <Divider />

          <div className="flex flex-col gap-400">
            {records.length === 0 ? (
              <p className="typo-body2 text-text-alternative py-400 text-center">
                출석 기록이 없습니다.
              </p>
            ) : (
              records.map((record) => (
                <div key={record.id} className="flex flex-col gap-200">
                  <div className="flex items-center gap-200">
                    <Tag
                      className={cn(
                        'w-[49px] justify-center rounded-full py-[2px]',
                        record.statusClassName,
                      )}
                    >
                      {record.statusLabel}
                    </Tag>
                    <span className="typo-sub3 text-text-strong">{record.title}</span>
                  </div>
                  <div className="typo-body2 text-text-alternative flex flex-col">
                    <span>날짜 : {record.date}</span>
                    <span>장소 : {record.location}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export { AttendanceHistoryContent };
