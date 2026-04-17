import { NextRequest, NextResponse } from 'next/server';

import {
  ACCESS_COOKIE_OPTIONS,
  ACCESS_TOKEN_KEY,
  REFRESH_COOKIE_OPTIONS,
  REFRESH_TOKEN_KEY,
} from '@/lib/apis/cookies';
import { APPLE_PENDING_STATE_KEY } from '@/constants/apple';
import { decodeOAuthState } from '@/lib/auth/oauthState';
import { getPostLoginUrl } from '@/lib/auth/redirectPaths';

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const error = request.nextUrl.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/login', appUrl));
  }

  const registered = request.nextUrl.searchParams.get('registered') === 'true';
  const name = request.nextUrl.searchParams.get('name');

  // 백엔드가 Set-Cookie로 설정한 토큰 읽기
  const rawAccessToken = request.cookies.get('Authorization')?.value;
  const rawRefreshToken = request.cookies.get('Authorization_refresh')?.value;

  // Apple은 state를 프론트로 돌려주지 않으므로, 로그인 시작 시점에 심어둔 쿠키에서 읽는다.
  const pendingStateRaw = request.cookies.get(APPLE_PENDING_STATE_KEY)?.value;
  let pendingState: string | null = null;
  try {
    pendingState = pendingStateRaw ? decodeURIComponent(pendingStateRaw) : null;
  } catch {
    // 깨진 쿠키 값 → invalid 처리 후 쿠키 삭제
    const response = NextResponse.redirect(new URL('/login', appUrl));
    response.cookies.set(APPLE_PENDING_STATE_KEY, '', { path: '/', maxAge: 0 });
    return response;
  }
  const decoded = decodeOAuthState(pendingState);

  if (decoded.type === 'invalid') {
    return NextResponse.redirect(new URL('/login', appUrl));
  }

  let redirectUrl: string;
  if (decoded.type === 'join-no-code') {
    const params = new URLSearchParams({ clubId: decoded.clubId });
    redirectUrl = registered
      ? getPostLoginUrl({ intent: 'join-no-code', clubId: decoded.clubId })
      : `/login?terms=true&intent=join-no-code&${params.toString()}`;
  } else if (decoded.type === 'join') {
    const params = new URLSearchParams({ clubId: decoded.clubId, code: decoded.code });
    redirectUrl = registered
      ? getPostLoginUrl({ intent: 'join', clubId: decoded.clubId, code: decoded.code })
      : `/login?terms=true&intent=join&${params.toString()}`;
  } else if (decoded.type === 'redirect') {
    redirectUrl = registered
      ? getPostLoginUrl({ redirectPath: decoded.path })
      : `/login?terms=true&redirect=${encodeURIComponent(decoded.path)}`;
  } else if (decoded.type === 'intent') {
    redirectUrl = registered
      ? getPostLoginUrl({ intent: decoded.intent })
      : `/login?terms=true&intent=${decoded.intent}`;
  } else {
    // type === 'none'
    redirectUrl = registered ? '/hub' : '/login?terms=true';
  }

  const redirectResponse = NextResponse.redirect(new URL(redirectUrl, appUrl));

  // 프론트 쿠키 체계로 변환하여 설정
  if (rawAccessToken) {
    const accessToken = rawAccessToken.replace(/^Bearer\s+/i, '').trim();
    if (accessToken) {
      redirectResponse.cookies.set(ACCESS_TOKEN_KEY, accessToken, ACCESS_COOKIE_OPTIONS);
    }
  }

  if (rawRefreshToken) {
    const refreshToken = rawRefreshToken.replace(/^Bearer\s+/i, '').trim();
    if (refreshToken) {
      redirectResponse.cookies.set(REFRESH_TOKEN_KEY, refreshToken, REFRESH_COOKIE_OPTIONS);
    }
  }

  if (name) {
    redirectResponse.cookies.set('userName', name, {
      path: '/',
      maxAge: 60 * 5,
    });
  }

  // pending state 쿠키는 사용 후 즉시 삭제
  redirectResponse.cookies.set(APPLE_PENDING_STATE_KEY, '', {
    path: '/',
    maxAge: 0,
  });

  return redirectResponse;
}
