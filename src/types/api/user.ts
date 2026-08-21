import type { components } from '@/types/api';

type S<K extends keyof components['schemas']> = components['schemas'][K];

// ── Requests ──────────────────────────────────────────────────────────────────

/** 내 정보 수정 요청 */
export type UpdateUserRequest =
  S<'com.weeth.domain.user.application.dto.request.UpdateUserProfileRequest'>;

/** 문의하기 요청 */
export type CreateInquiryRequest =
  S<'com.weeth.domain.user.application.dto.request.CreateInquiryRequest'>;

/** 멀티프로필 생성 요청 */
export type CreateMultiProfileRequest =
  S<'com.weeth.domain.user.application.dto.request.CreateMultiProfileRequest'>;

/** 멀티프로필 수정 요청 */
export type UpdateMultiProfileRequest =
  S<'com.weeth.domain.user.application.dto.request.UpdateMultiProfileRequest'>;

/** 동아리별 사용 프로필 변경 요청 */
export type AssignClubProfileRequest =
  S<'com.weeth.domain.user.application.dto.request.AssignClubProfileRequest'>;

/** 동아리-프로필 매핑 단건 */
export type ClubProfileAssignment =
  S<'com.weeth.domain.user.application.dto.request.ClubProfileAssignmentRequest'>;

// ── Responses ─────────────────────────────────────────────────────────────────

/** 사용자 정보 (이름·프로필이미지·역할) */
export type UserInfo = S<'com.weeth.domain.user.application.dto.response.UserInfo'>;

/** 멀티프로필 단건 */
export type UserProfile = S<'com.weeth.domain.user.application.dto.response.UserProfileResponse'>;

/** 멀티프로필 목록 */
export type UserProfiles = S<'com.weeth.domain.user.application.dto.response.UserProfilesResponse'>;

/** 프로필이 사용 중인 동아리 */
export type UserProfileClub =
  S<'com.weeth.domain.user.application.dto.response.UserProfileClubResponse'>;

/** 프로필 배정 가능한 동아리 단건 */
export type UserProfileAssignableClub =
  S<'com.weeth.domain.user.application.dto.response.UserProfileAssignableClubResponse'>;

/** 프로필 배정 가능한 동아리 목록 */
export type UserProfileAssignableClubs =
  S<'com.weeth.domain.user.application.dto.response.UserProfileAssignableClubsResponse'>;

/** 마이페이지 요약 전체 */
export type UserMyPage = S<'com.weeth.domain.user.application.dto.response.UserMyPageResponse'>;

/** 마이페이지 개인정보 */
export type UserMyPageInfo =
  S<'com.weeth.domain.user.application.dto.response.UserMyPageInfoResponse'>;

/** 마이페이지 통계 (게시글 수·출석 수) */
export type UserMyPageStats =
  S<'com.weeth.domain.user.application.dto.response.UserMyPageStatsResponse'>;

/** 마이페이지 현재 사용 중인 프로필 */
export type UserMyPageCurrentProfile =
  S<'com.weeth.domain.user.application.dto.response.UserMyPageCurrentProfileResponse'>;

/** 마이페이지 프로필별 사용 동아리 목록 */
export type UserMyPageUsingProfile =
  S<'com.weeth.domain.user.application.dto.response.UserMyPageUsingProfileResponse'>;

/** 내가 쓴 글 아이템 */
export type UserMyPost = S<'com.weeth.domain.user.application.dto.response.UserMyPostResponse'>;

/** 내가 출석한 세션 아이템 */
export type UserAttendedSession =
  S<'com.weeth.domain.user.application.dto.response.UserAttendedSessionResponse'>;

/** 내가 쓴 글 슬라이스 (페이지네이션 wrapper 포함) */
export type UserMyPostSlice =
  S<'com.weeth.global.common.response.SliceResponseCom.weeth.domain.user.application.dto.response.UserMyPostResponse'>;

/** 내가 출석한 세션 슬라이스 (페이지네이션 wrapper 포함) */
export type UserAttendedSessionSlice =
  S<'com.weeth.global.common.response.SliceResponseCom.weeth.domain.user.application.dto.response.UserAttendedSessionResponse'>;
