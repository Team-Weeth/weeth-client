'use client';

import Link from 'next/link';

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Divider,
  Tag,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatKoreanDate, formatTime } from '@/lib/formatTime';
import { ATTENDANCE_ATTENDANCE_STATUS_CONFIG } from '@/constants/attendance';
import type { AttendanceSummary } from '@/types/attendance';

interface AttendanceHistoryContentProps {
  summary: AttendanceSummary;
}

function AttendanceHistoryContent({ summary }: AttendanceHistoryContentProps) {
  const { total = 0, attendanceCount = 0, absenceCount = 0, attendances = [] } = summary;

  return (
    <div className="mx-auto flex w-full max-w-[1025px] flex-col gap-700 pt-600 pb-800">
      <div className="flex flex-col items-start gap-200 self-stretch px-[36px]">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/attendance" className="typo-caption1 text-text-alternative">
                  출석
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="typo-caption1 text-text-alternative">
                출석 조회
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="typo-h2 text-text-normal text-pretty">출석 조회</h1>
      </div>

      <div className="flex flex-col gap-700 px-450">
        <div className="bg-container-neutral flex flex-col gap-400 rounded-lg p-400">
          <div className="flex gap-200">
            <StatBox label="정기 모임" value={`${total}회`} />
            <StatBox label="출석" value={`${attendanceCount}회`} />
            <StatBox label="결석" value={`${absenceCount}회`} />
          </div>

          <Divider />

          <div className="flex flex-col gap-400">
            {attendances.length === 0 ? (
              <p className="typo-body2 text-text-alternative py-400 text-center">
                출석 기록이 없습니다.
              </p>
            ) : (
              attendances.map((record) => {
                const startDate = new Date(record.start);
                const endDate = new Date(record.end);

                const statusConfig = ATTENDANCE_STATUS_CONFIG[record.status];

                return (
                  <div key={record.id} className="flex flex-col gap-200">
                    <div className="flex items-center gap-200">
                      <Tag
                        className={cn(
                          'w-[49px] justify-center rounded-full py-[2px]',
                          statusConfig.className,
                        )}
                      >
                        {statusConfig.label}
                      </Tag>
                      <span className="typo-sub2 text-text-strong">{record.title}</span>
                    </div>
                    <div className="typo-body2 text-text-alternative flex flex-col">
                      <span>
                        날짜 : {formatKoreanDate(startDate)} ({formatTime(startDate)}~
                        {formatTime(endDate)})
                      </span>
                      <span>장소 : {record.location}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatBoxProps {
  label: string;
  value: string;
}

function StatBox({ label, value }: StatBoxProps) {
  return (
    <div className="bg-container-neutral-interaction flex flex-1 flex-col items-center gap-[17px] rounded-md pt-[15px] pb-[19px]">
      <span className="typo-body2 text-text-alternative">{label}</span>
      <span className="typo-sub1 text-text-strong tabular-nums">{value}</span>
    </div>
  );
}

export { AttendanceHistoryContent, type AttendanceHistoryContentProps };
