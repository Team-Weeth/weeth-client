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

  const handleSave = useCallback(
    async (updates: { id: number; status: 'ATTEND' | 'ABSENT' }[]) => {
      await mutateAsync(updates);
    },
    [mutateAsync],
  );

  return (
    <AttendanceCard
      date={date}
      title={title}
      isCurrentWeek={isCurrentWeek}
      members={members}
      onSave={handleSave}
      onDirtyChange={handleDirtyChange}
    />
  );
}

export { AttendanceSessionCard, type AttendanceSessionCardProps };
