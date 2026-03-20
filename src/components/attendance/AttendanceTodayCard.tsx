'use client';

import { Card } from '@/components/ui';

interface AttendanceTodayCardProps {
  overline: string;
  title: string;
  description: string;
  isAdmin?: boolean;
}

function AttendanceTodayCard({
  overline,
  title,
  description,
  isAdmin = false,
}: AttendanceTodayCardProps) {
  return (
    <Card
      variant="buttonSet"
      overline={overline}
      title={title}
      description={description}
      showArrow={false}
      onPrimaryClick={() => {}}
      onSecondaryClick={isAdmin ? () => {} : undefined}
      secondaryButtonText="출석코드 확인"
    />
  );
}

export { AttendanceTodayCard, type AttendanceTodayCardProps };
