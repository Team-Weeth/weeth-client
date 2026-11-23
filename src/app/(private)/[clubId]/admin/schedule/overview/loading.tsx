import { AdminPageContainer } from '@/components/admin/AdminPageContainer';
import { SchedulePageSkeleton } from '@/components/admin/schedule/general/SchedulePageSkeleton';

export default function Loading() {
  return (
    <AdminPageContainer>
      <SchedulePageSkeleton />
    </AdminPageContainer>
  );
}
