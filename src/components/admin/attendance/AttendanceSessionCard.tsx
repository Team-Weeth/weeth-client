'use client';

import { useCallback } from 'react';

import { useAdminAttendance, useUpdateAttendanceStatus } from '@/hooks/queries/admin';

import { AttendanceCard } from './AttendanceCard';

interface AttendanceSessionCardProps {
  sessionId: number;
  date: string;
  title: string;
  isCurrentWeek?: boolean;
  onDirtyChange?: (sessionId: number, dirty: boolean) => void;
}

function AttendanceSessionCard({
  sessionId,
  date,
  title,
  isCurrentWeek,
  onDirtyChange,
}: AttendanceSessionCardProps) {
  const { data: members = [] } = useAdminAttendance(sessionId);
  const { mutateAsync } = useUpdateAttendanceStatus(sessionId);

  const handleDirtyChange = useCallback(
    (dirty: boolean) => onDirtyChange?.(sessionId, dirty),
    [onDirtyChange, sessionId],
  );

  return (
    <AttendanceCard
      date={date}
      title={title}
      isCurrentWeek={isCurrentWeek}
      members={members}
      onSave={mutateAsync}
      onDirtyChange={handleDirtyChange}
    />
  );
}

export { AttendanceSessionCard, type AttendanceSessionCardProps };
