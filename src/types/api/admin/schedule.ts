import type { components } from '@/types/admin-api';

type S<K extends keyof components['schemas']> = components['schemas'][K];

// ── Requests ──────────────────────────────────────────────────────────────────

/** 이벤트(일정) 생성 요청 */
export type AdminScheduleSaveRequest =
  S<'com.weeth.domain.schedule.application.dto.request.ScheduleSaveRequest'>;

/** 이벤트(일정) 수정 요청 */
export type AdminScheduleUpdateRequest =
  S<'com.weeth.domain.schedule.application.dto.request.ScheduleUpdateRequest'>;
