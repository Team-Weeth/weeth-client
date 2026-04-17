import { NextRequest, NextResponse } from 'next/server';

import { API_BASE_PATH } from '@/constants/api';
import { decodeOAuthState } from '@/lib/auth/oauthState';
import { getPostLoginUrl } from '@/lib/auth/redirectPaths';
import {
  ACCESS_COOKIE_OPTIONS,
  ACCESS_TOKEN_KEY,
  REFRESH_COOKIE_OPTIONS,
  REFRESH_TOKEN_KEY,
} from '@/lib/apis/cookies';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;

  if (!code) {
    return NextResponse.redirect(new URL('/login', appUrl));
  }

  const response = await fetch(`${API_BASE_PATH}/users/social/kakao`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ authCode: code }),
  });

  if (!response.ok) {
    return NextResponse.redirect(new URL('/login', appUrl));
  }

  const json = await response.json();
  const { accessToken, refreshToken, registered, name } = json.data;

  if (!accessToken || !refreshToken) {
    return NextResponse.redirect(new URL('/login', appUrl));
  }

  const state = request.nextUrl.searchParams.get('state');
  const decoded = decodeOAuthState(state);

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
    // proxy.ts가 redirect param으로 설정한 원래 경로
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

  redirectResponse.cookies.set(ACCESS_TOKEN_KEY, accessToken, ACCESS_COOKIE_OPTIONS);
  redirectResponse.cookies.set(REFRESH_TOKEN_KEY, refreshToken, REFRESH_COOKIE_OPTIONS);

  if (name) {
    redirectResponse.cookies.set('userName', name, {
      path: '/',
      maxAge: 60 * 5,
    });
  }

  return redirectResponse;
}
