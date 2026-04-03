import { NextRequest, NextResponse } from 'next/server';

import { API_BASE_PATH } from '@/constants/api';
import {
  ACCESS_COOKIE_OPTIONS,
  ACCESS_TOKEN_KEY,
  REFRESH_COOKIE_OPTIONS,
  REFRESH_TOKEN_KEY,
} from '@/lib/apis/cookies';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const origin = request.nextUrl.origin;

  if (!code) {
    return NextResponse.redirect(new URL('/login', origin));
  }

  const response = await fetch(`${API_BASE_PATH}/users/social/kakao`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ authCode: code }),
  });

  if (!response.ok) {
    return NextResponse.redirect(new URL('/login', origin));
  }

  const json = await response.json();
  const { accessToken, refreshToken, registered, name } = json.data;

  const state = request.nextUrl.searchParams.get('state');

  let redirectUrl: string;
  if (state?.startsWith('join-no-code:')) {
    const clubId = state.split(':')[1];
    redirectUrl = registered
      ? `/club/join?clubId=${clubId}`
      : `/login?terms=true&intent=join-no-code&clubId=${clubId}`;
  } else if (state?.startsWith('join:')) {
    const [, clubId, inviteCode] = state.split(':');
    redirectUrl = registered
      ? `/joining?clubId=${clubId}&code=${inviteCode}`
      : `/login?terms=true&intent=join&clubId=${clubId}&code=${inviteCode}`;
  } else {
    redirectUrl = registered
      ? `/hub${state ? `?intent=${state}` : ''}`
      : `/login?terms=true${state ? `&intent=${state}` : ''}`;
  }

  const redirectResponse = NextResponse.redirect(new URL(redirectUrl, origin));

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
