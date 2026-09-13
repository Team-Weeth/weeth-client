import type { components } from '@/types/admin-api';

type S<K extends keyof components['schemas']> = components['schemas'][K];

// ── Requests ──────────────────────────────────────────────────────────────────

/** 페널티 부여 요청 */
export type AdminSavePenaltyRequest =
  S<'com.weeth.domain.penalty.application.dto.request.SavePenaltyRequest'>;

/** 페널티 수정 요청 (penaltyId 외 필드는 생략 시 변경 안 함) */
export type AdminUpdatePenaltyRequest =
  S<'com.weeth.domain.penalty.application.dto.request.UpdatePenaltyRequest'>;

/** 페널티 규정 저장 요청 (content가 비면 규정 삭제) */
export type AdminSavePenaltyRuleRequest =
  S<'com.weeth.domain.penalty.application.dto.request.SavePenaltyRuleRequest'>;

// ── Responses ─────────────────────────────────────────────────────────────────

/** 멤버 페널티 상세 (멤버 정보 + 페널티 목록) */
export type AdminMemberPenaltyDetail =
  S<'com.weeth.domain.penalty.application.dto.response.MemberPenaltyDetailResponse'>;

/** 페널티 이력 한 건 */
export type AdminPenaltyDetail =
  S<'com.weeth.domain.penalty.application.dto.response.PenaltyDetailResponse'>;

// ── Derived types ─────────────────────────────────────────────────────────────

/** 페널티 타입 */
export type AdminPenaltyType = AdminSavePenaltyRequest['penaltyType'];
