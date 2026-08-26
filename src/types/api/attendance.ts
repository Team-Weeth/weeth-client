import type { components } from '@/types/api';

type S<K extends keyof components['schemas']> = components['schemas'][K];

// ── Requests ──────────────────────────────────────────────────────────────────

/** 출석체크 요청 */
export type CheckInRequest =
  S<'com.weeth.domain.attendance.application.dto.request.CheckInRequest'>;

// ── Responses ─────────────────────────────────────────────────────────────────

/** 출석 요약 (출석률·오늘 세션 정보) */
export type AttendanceSummary =
  S<'com.weeth.domain.attendance.application.dto.response.AttendanceSummaryResponse'>;

/** 출석 상세 내역 (전체 기록) */
export type AttendanceDetail =
  S<'com.weeth.domain.attendance.application.dto.response.AttendanceDetailResponse'>;

/** 출석 내역 아이템 */
export type AttendanceRecord =
  S<'com.weeth.domain.attendance.application.dto.response.AttendanceResponse'>;

// ── Derived types ─────────────────────────────────────────────────────────────

/** 출석 상태 */
export type AttendanceStatus = NonNullable<AttendanceRecord['status']>;
