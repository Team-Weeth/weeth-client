import { SchedulePageSkeleton } from '@/components/admin/schedule/general/SchedulePageSkeleton';

// 로딩 시점에는 플래그를 알 수 없으므로 기본값(OFF)인 개편 전 화면의 스켈레톤을 보여준다.
export default function Loading() {
  return <SchedulePageSkeleton />;
}
