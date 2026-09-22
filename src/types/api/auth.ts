import type { components } from '@/types/api';

type S<K extends keyof components['schemas']> = components['schemas'][K];

/** 약관 동의 요청 */
export type AgreeTermsRequest =
  S<'com.weeth.domain.user.application.dto.request.AgreeTermsRequest'>;

/** 소셜 로그인 요청 (카카오/애플 공통) */
export type SocialLoginRequest =
  S<'com.weeth.domain.user.application.dto.request.SocialLoginRequest'>;

/** JWT 토큰 (accessToken + refreshToken) */
export type JwtTokens = S<'com.weeth.global.auth.jwt.application.dto.JwtDto'>;

/** 소셜 로그인 응답 */
export type SocialLoginResponse =
  S<'com.weeth.domain.user.application.dto.response.SocialLoginResponse'>;
