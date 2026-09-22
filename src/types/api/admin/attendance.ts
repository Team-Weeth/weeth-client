import type { components } from '@/types/admin-api';

type S<K extends keyof components['schemas']> = components['schemas'][K];

// ── Requests ──────────────────────────────────────────────────────────────────

/** 출석 상태 수정 요청 단건 */
export type AdminUpdateAttendanceStatusRequest =
  S<'com.weeth.domain.attendance.application.dto.request.UpdateAttendanceStatusRequest'>;

// ── Responses ─────────────────────────────────────────────────────────────────

/** QR 코드 생성 응답 (세션 ID·6자리 코드·만료 시각) */
export type AdminQrToken =
  S<'com.weeth.domain.attendance.application.dto.response.QrTokenResponse'>;

/** 세션별 전체 인원 출석 정보 아이템 */
export type AdminAttendanceInfo =
  S<'com.weeth.domain.attendance.application.dto.response.AttendanceInfoResponse'>;

// ── Derived types ─────────────────────────────────────────────────────────────

/** 출석 상태 */
export type AdminAttendanceStatus = NonNullable<AdminAttendanceInfo['status']>;

/** 멤버 상태 (출석 정보 내) */
export type AdminAttendanceMemberStatus = AdminAttendanceInfo['memberStatus'];
