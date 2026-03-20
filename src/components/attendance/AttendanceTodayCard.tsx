'use client';

import { Card } from '@/components/ui';

interface AttendanceTodayCardProps {
  overline: string;
  title: string;
  description: string;
}

function AttendanceTodayCard({ overline, title, description }: AttendanceTodayCardProps) {
  return (
    <Card
      variant="buttonSet"
      overline={overline}
      title={title}
      description={description}
      showArrow={false}
      onPrimaryClick={() => {}}
    />
  );
}

export { AttendanceTodayCard, type AttendanceTodayCardProps };
