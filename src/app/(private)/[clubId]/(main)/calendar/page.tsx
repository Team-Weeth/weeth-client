import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CalendarMain } from '@/components/calendar/CalendarMain';
import { CalendarMainSkeleton } from '@/components/calendar/skeleton/CalendarMainSkeleton';

export const metadata: Metadata = { title: '일정' };

export default function CalendarPage() {
  return (
    <Suspense fallback={<CalendarMainSkeleton />}>
      <CalendarMain />
    </Suspense>
  );
}
