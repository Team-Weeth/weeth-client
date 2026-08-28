import type { components } from '@/types/api';

type S<K extends keyof components['schemas']> = components['schemas'][K];

/** 일정 요약 아이템 (캘린더용) */
export type ScheduleItem = S<'com.weeth.domain.schedule.application.dto.response.ScheduleResponse'>;

/** 이벤트 상세 */
export type EventDetail = S<'com.weeth.domain.schedule.application.dto.response.EventResponse'>;

/** 정기모임 상세 */
export type SessionDetail = S<'com.weeth.domain.session.application.dto.response.SessionResponse'>;

// ── Derived types ─────────────────────────────────────────────────────────────

/** 일정 유형 */
export type ScheduleType = ScheduleItem['type'];
