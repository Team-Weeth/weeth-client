'use client';

import { useState } from 'react';

import { Card } from '@/components/ui';
import { AttendanceCodeModal } from '@/components/attendance/AttendanceCodeModal';

interface AttendanceTodayCardProps {
  overline: string;
  title: string;
  description: string;
  start: string;
  endTime: string;
  location: string;
  isAdmin?: boolean;
}

function AttendanceTodayCard({
  overline,
  title,
  description,
  start,
  endTime,
  location,
  isAdmin = false,
}: AttendanceTodayCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Card
        variant="buttonSet"
        overline={overline}
        title={title}
        description={description}
        showArrow={false}
        onPrimaryClick={() => setModalOpen(true)}
        // TODO: 관리자 출석코드 확인 기능 별도 브랜치에서 구현 예정
        onSecondaryClick={isAdmin ? () => {} : undefined}
        secondaryButtonText="출석코드 확인"
      />

      <AttendanceCodeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={title}
        start={start}
        endTime={endTime}
        location={location}
      />
    </>
  );
}

export { AttendanceTodayCard, type AttendanceTodayCardProps };
