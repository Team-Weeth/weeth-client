import type { components } from '@/types/admin-api';

type S<K extends keyof components['schemas']> = components['schemas'][K];

// ── Requests ──────────────────────────────────────────────────────────────────

/** 정기모임 생성 요청 (반복 설정 포함) */
export type AdminSessionCreateRequest =
  S<'com.weeth.domain.session.application.dto.request.SessionCreateRequest'>;

/** 정기모임 수정 요청 */
export type AdminSessionUpdateRequest =
  S<'com.weeth.domain.session.application.dto.request.SessionUpdateRequest'>;

// ── Responses ─────────────────────────────────────────────────────────────────

/** 정기모임 목록 (이번 주 + 그룹 단위) */
export type AdminSessionInfos =
  S<'com.weeth.domain.session.application.dto.response.SessionInfosResponse'>;

/** 반복 그룹 단위 세션 묶음 */
export type AdminSessionGroup =
  S<'com.weeth.domain.session.application.dto.response.SessionGroupResponse'>;

/** 정기모임 아이템 */
export type AdminSessionInfo =
  S<'com.weeth.domain.session.application.dto.response.SessionInfoResponse'>;

// ── Derived types ─────────────────────────────────────────────────────────────

/** 정기모임 상태 */
export type AdminSessionStatus = AdminSessionInfo['status'];

/** 반복 그룹 상태 */
export type AdminSessionGroupStatus = AdminSessionGroup['status'];

/** 반복 유형 */
export type AdminRecurrenceType = NonNullable<AdminSessionCreateRequest['recurrenceType']>;
