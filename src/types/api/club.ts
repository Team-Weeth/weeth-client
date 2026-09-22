import type { components } from '@/types/api';

type S<K extends keyof components['schemas']> = components['schemas'][K];

// ── Requests ──────────────────────────────────────────────────────────────────

/** 동아리 생성 요청 */
export type ClubCreateRequest =
  S<'com.weeth.domain.club.application.dto.request.ClubCreateRequest'>;

/** 동아리 가입 요청 */
export type ClubJoinRequest = S<'com.weeth.domain.club.application.dto.request.ClubJoinRequest'>;

/** 초기 활동 기수 설정 요청 */
export type ClubMemberCardinalSetRequest =
  S<'com.weeth.domain.club.application.dto.request.ClubMemberCardinalSetRequest'>;

// ── Responses ─────────────────────────────────────────────────────────────────

/** 동아리 생성 응답 */
export type ClubCreateResponse =
  S<'com.weeth.domain.club.application.dto.response.ClubCreateResponse'>;

/** 동아리 공개 정보 (이름·소개·프로필 사진) */
export type ClubPublicInfo = S<'com.weeth.domain.club.application.dto.response.ClubPublicResponse'>;

/** 내가 가입한 동아리 상세 정보 */
export type ClubInfo = S<'com.weeth.domain.club.application.dto.response.ClubInfoResponse'>;

/** 동아리에서 사용 중인 멀티프로필 */
export type ClubUsingProfile =
  S<'com.weeth.domain.club.application.dto.response.ClubUsingProfileResponse'>;

/** 멤버 프로필 전체 정보 */
export type ClubMemberProfile =
  S<'com.weeth.domain.club.application.dto.response.ClubMemberProfileResponse'>;

/** 멤버 요약 정보 (역할 포함) */
export type ClubMemberSummary =
  S<'com.weeth.domain.club.application.dto.response.ClubMemberSummaryResponse'>;

/** 프로필 완성 상태 */
export type ProfileStatus =
  S<'com.weeth.domain.club.application.dto.response.ProfileStatusResponse'>;

/** 동아리 가입 여부 */
export type ClubMembershipStatus =
  S<'com.weeth.domain.club.application.dto.response.ClubMembershipStatusResponse'>;

/** 기수 정보 */
export type CardinalInfo = S<'com.weeth.domain.cardinal.application.dto.response.CardinalResponse'>;

// ── Derived types ─────────────────────────────────────────────────────────────

/** 멤버 권한 */
export type MemberRole = ClubInfo['memberRole'];

/** 멤버 상태 */
export type MemberStatus = ClubInfo['memberStatus'];

/** 기수 상태 */
export type CardinalStatus = CardinalInfo['status'];
