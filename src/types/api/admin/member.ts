import type { components } from '@/types/admin-api';

type S<K extends keyof components['schemas']> = components['schemas'][K];

// ── Requests ──────────────────────────────────────────────────────────────────

/** 멤버 권한 변경 요청 */
export type AdminUpdateMemberRoleRequest =
  S<'com.weeth.domain.club.application.dto.request.ClubMemberRoleUpdateRequest'>;

/** 멤버 기수 수정 요청 */
export type AdminUpdateMemberCardinalsRequest =
  S<'com.weeth.domain.club.application.dto.request.UpdateMemberCardinalRequest'>;

/** 멤버 OB 기수 등록 요청 단건 */
export type AdminApplyObRequest =
  S<'com.weeth.domain.club.application.dto.request.ClubMemberApplyObRequest'>;

// ── Responses ─────────────────────────────────────────────────────────────────

/** 멤버 목록 아이템 (출석률·패널티 포함) */
export type AdminClubMember =
  S<'com.weeth.domain.club.application.dto.response.ClubMemberResponse'>;

/** 멤버 목록 페이지 */
export type AdminClubMemberPage =
  S<'com.weeth.global.common.response.PageResponseCom.weeth.domain.club.application.dto.response.ClubMemberResponse'>;

// ── Derived types ─────────────────────────────────────────────────────────────

/** 멤버 권한 */
export type AdminMemberRole = AdminClubMember['memberRole'];

/** 멤버 상태 */
export type AdminMemberStatus = AdminClubMember['memberStatus'];
