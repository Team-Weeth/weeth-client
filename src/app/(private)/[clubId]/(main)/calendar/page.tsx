import { Suspense } from 'react';
import { CalendarMain } from '@/components/calendar/CalendarMain';
import { CalendarMainSkeleton } from '@/components/calendar/skeleton/CalendarMainSkeleton';

export default function CalendarPage() {
  return (
    <Suspense fallback={<CalendarMainSkeleton />}>
      <CalendarMain />
    </Suspense>
  );
}
