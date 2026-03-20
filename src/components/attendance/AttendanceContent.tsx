'use client';

import Link from 'next/link';
import { useState } from 'react';

import { HomeIcon } from '@/assets/icons';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
  Card,
  Icon,
} from '@/components/ui';
import { AttendanceStatus } from '@/components/attendance/AttendanceStatus';
import { AttendanceTodayCard } from '@/components/attendance/AttendanceTodayCard';
import { formatAttendanceDescription } from '@/lib/formatTime';
import type { AttendanceData } from '@/types/attendance';

interface AttendanceContentProps {
  name: string;
  attendance: AttendanceData;
  isAdmin?: boolean;
}

function AttendanceContent({ name, attendance, isAdmin = false }: AttendanceContentProps) {
  const [isChecked, setIsChecked] = useState(false);
  const { attendanceRate, title, start, end, location } = attendance;
  const description = formatAttendanceDescription(start, end, location);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleAttendanceComplete(code: string) {
    // TODO: API 연결 시 출석 코드 검증 로직 추가
    setIsChecked(true);
  }

  return (
    <div className="mx-auto flex w-full max-w-[1025px] flex-col gap-700 pt-600">
      <Breadcrumb className="px-450">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" className="flex items-center">
                <Icon src={HomeIcon} size={16} className="text-icon-alternative" aria-label="홈" />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="typo-caption1 text-text-alternative">출석</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <AttendanceStatus name={name} attendanceRate={attendanceRate} className="px-450" />

      <div className="flex flex-col gap-300 px-450">
        <AttendanceTodayCard
          overline="오늘의 출석"
          title={title}
          description={description}
          start={start}
          endTime={end}
          location={location}
          isAdmin={isAdmin}
          isChecked={isChecked}
          onAttendanceComplete={handleAttendanceComplete}
        />

        <Card variant="onlyText" overline="출석" title="출석 기록" />
      </div>
    </div>
  );
}

export { AttendanceContent, type AttendanceContentProps };
