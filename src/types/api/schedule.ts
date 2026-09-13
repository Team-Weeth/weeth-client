import type { components } from '@/types/api';

type S<K extends keyof components['schemas']> = components['schemas'][K];

/** 일정 요약 아이템 (캘린더용) */
export type ScheduleItem = S<'com.weeth.domain.schedule.application.dto.response.ScheduleResponse'>;

/** 일정 상세 - EVENT·SESSION 통합 */
export type ScheduleDetail =
  S<'com.weeth.domain.schedule.application.dto.response.ScheduleDetailResponse'>;

/** 참석자 정보 */
export type AttendeeInfo = S<'com.weeth.domain.schedule.application.dto.response.AttendeeResponse'>;

/** 이벤트 상세 */
export type EventDetail = S<'com.weeth.domain.schedule.application.dto.response.EventResponse'>;

/** 정기모임 상세 */
export type SessionDetail = S<'com.weeth.domain.session.application.dto.response.SessionResponse'>;

// ── Derived types ─────────────────────────────────────────────────────────────

/** 일정 유형 */
export type ScheduleType = ScheduleItem['type'];

/** 내 출석 상태 */
export type AttendanceStatus = NonNullable<ScheduleDetail['myAttendanceStatus']>;
