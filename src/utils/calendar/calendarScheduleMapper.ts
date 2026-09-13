import { computeDDay } from '@/utils/shared/date';
import type { ScheduleItem as ApiScheduleItem, ScheduleDetail as ApiScheduleDetail } from '@/types/api/schedule';
import type { ScheduleDetail } from '@/types/calendar';

const ROLE_LABEL: Record<string, string> = {
  LEAD: '회장',
  ADMIN: '운영진',
  USER: '회원',
};

/** ScheduleItem (월별 목록) → UI ScheduleDetail (기본 필드만) */
function toBaseUiSchedule(item: ApiScheduleItem): ScheduleDetail {
  return {
    id: item.id,
    title: item.title,
    start: item.start,
    end: item.end,
    type: item.type,
    location: item.location,
    dDay: computeDDay(item.start),
  };
}

/** API ScheduleDetail (상세 응답) → UI ScheduleDetail (전체 필드) */
function toUiScheduleDetail(api: ApiScheduleDetail, clubId: string | null): ScheduleDetail {
  return {
    id: api.id,
    title: api.title,
    start: api.start,
    end: api.end,
    type: api.type,
    location: api.location,
    description: api.description,
    dDay: computeDDay(api.start),
    clubId,
    host: api.creatorName ? { name: api.creatorName } : undefined,
    attendees: api.attendees?.map((a) => ({
      name: a.name,
      department: a.department,
      imageUrl: a.profileImageUrl,
      position: ROLE_LABEL[a.role] ?? a.role,
    })),
    attendeeCount: api.totalAttendees,
    showAttendeeCount: api.totalAttendees != null,
    hasAttendanceCheck: api.type === 'SESSION' && api.myAttendanceStatus != null,
    attendanceStatus: api.myAttendanceStatus ?? undefined,
    attendanceCompletedAt: api.attendedAt,
  };
}

export { toBaseUiSchedule, toUiScheduleDetail };
