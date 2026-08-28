import type { components } from '@/types/admin-api';

type S<K extends keyof components['schemas']> = components['schemas'][K];

// ── Requests ──────────────────────────────────────────────────────────────────

/** 동아리 정보 수정 요청 */
export type AdminClubUpdateRequest =
  S<'com.weeth.domain.club.application.dto.request.ClubUpdateRequest'>;

// ── Responses ─────────────────────────────────────────────────────────────────

/** 동아리 상세 정보 (초대 코드·연락처 포함) */
export type AdminClubDetail =
  S<'com.weeth.domain.club.application.dto.response.ClubDetailResponse'>;

// ── Derived types ─────────────────────────────────────────────────────────────

/** 주 연락처 수단 */
export type PrimaryContact = AdminClubDetail['primaryContact'];
