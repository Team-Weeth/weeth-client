'use client';

import { useState } from 'react';

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
  const [expanded, setExpanded] = useState(false);
  const { data: members = [] } = useAdminAttendance(sessionId, { enabled: expanded });
  const { mutateAsync, isPending } = useUpdateAttendanceStatus(sessionId);

  const handleDirtyChange = (dirty: boolean) => onDirtyChange?.(sessionId, dirty);

  const handleSave = async (updates: { id: number; status: 'ATTEND' | 'ABSENT' }[]) => {
    await mutateAsync(updates);
  };

  return (
    <AttendanceCard
      date={date}
      title={title}
      isCurrentWeek={isCurrentWeek}
      members={members}
      onSave={handleSave}
      onDirtyChange={handleDirtyChange}
      onExpand={() => setExpanded(true)}
      isSaving={isPending}
    />
  );
}

export { AttendanceSessionCard, type AttendanceSessionCardProps };
