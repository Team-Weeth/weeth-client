import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';

import { API_BASE_PATH } from '@/constants/api';
import { APPLE_PENDING_STATE_KEY } from '@/constants/apple';
import { NATIVE_OAUTH_CALLBACK_URL } from '@/constants/nativeAuth';
import {
  ACCESS_COOKIE_OPTIONS,
  ACCESS_TOKEN_KEY,
  REFRESH_COOKIE_OPTIONS,
  REFRESH_TOKEN_KEY,
} from '@/lib/apis/cookies';
import { signNativeBridgeToken } from '@/lib/auth/nativeBridgeToken';
import { decodeOAuthState } from '@/lib/auth/oauthState';
import { getPostLoginUrl } from '@/lib/auth/redirectPaths';

/**
 * code 파라미터가 있으면 프론트에서 직접 POST /api/v4/users/social/apple을 호출하여
 * 토큰을 받아온다. (앱 WebView 쿠키 격리 해결용)
 * code가 없으면 기존 플로우(백엔드 Set-Cookie)를 사용한다.
 */
async function resolveTokens(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');

  if (code) {
    const response = await fetch(`${API_BASE_PATH}/users/social/apple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authCode: code }),
    });

    if (!response.ok) {
      Sentry.captureException(new Error(`Apple OAuth failed: HTTP ${response.status}`), {
        extra: { status: response.status, endpoint: `${API_BASE_PATH}/users/social/apple` },
      });
      return null;
    }

    const json = await response.json();
    const { accessToken, refreshToken, registered, name } = json.data;

    if (!accessToken || !refreshToken) return null;

    return { accessToken, refreshToken, registered: !!registered, name: name ?? null };
  }

  // 기존 플로우: 백엔드가 Set-Cookie로 설정한 토큰 읽기
  const rawAccessToken = request.cookies.get('Authorization')?.value;
  const rawRefreshToken = request.cookies.get('Authorization_refresh')?.value;
  const registered = request.nextUrl.searchParams.get('registered') === 'true';
  const name = request.nextUrl.searchParams.get('name');

  const accessToken = rawAccessToken?.replace(/^Bearer\s+/i, '').trim();
  const refreshToken = rawRefreshToken?.replace(/^Bearer\s+/i, '').trim();

  if (!accessToken || !refreshToken) return null;

  return { accessToken, refreshToken, registered, name: name ?? null };
}

function resolveState(request: NextRequest) {
  // code 플로우: 백엔드가 state를 쿼리 파라미터로 포워딩
  const stateParam = request.nextUrl.searchParams.get('state');
  if (stateParam) return decodeOAuthState(stateParam);

  // 기존 플로우: 로그인 시작 시점에 심어둔 쿠키에서 읽기
  const pendingStateRaw = request.cookies.get(APPLE_PENDING_STATE_KEY)?.value;
  try {
    const pendingState = pendingStateRaw ? decodeURIComponent(pendingStateRaw) : null;
    return decodeOAuthState(pendingState);
  } catch {
    return decodeOAuthState(null);
  }
}

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const error = request.nextUrl.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/login', appUrl));
  }

  const tokens = await resolveTokens(request);

  if (!tokens) {
    return NextResponse.redirect(new URL('/login', appUrl));
  }

  const { accessToken, refreshToken, registered, name } = tokens;

  const decoded = resolveState(request);

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

  if (decoded.isNative) {
    const bridgeToken = signNativeBridgeToken({
      accessToken,
      refreshToken,
      name: name ?? undefined,
      redirectUrl,
    });
    return NextResponse.redirect(`${NATIVE_OAUTH_CALLBACK_URL}?t=${bridgeToken}`);
  }

  const redirectResponse = NextResponse.redirect(new URL(redirectUrl, appUrl));

  redirectResponse.cookies.set(ACCESS_TOKEN_KEY, accessToken, ACCESS_COOKIE_OPTIONS);
  redirectResponse.cookies.set(REFRESH_TOKEN_KEY, refreshToken, REFRESH_COOKIE_OPTIONS);

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
