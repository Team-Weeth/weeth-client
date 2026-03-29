import { NextRequest, NextResponse } from 'next/server';

import { BASE_URL } from '@/constants';
import {
  ACCESS_COOKIE_OPTIONS,
  ACCESS_TOKEN_KEY,
  REFRESH_COOKIE_OPTIONS,
  REFRESH_TOKEN_KEY,
} from '@/lib/apis/cookies';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!code) {
    return NextResponse.redirect(new URL('/login', baseUrl));
  }

  const response = await fetch(`${BASE_URL}/api/v4/users/social/kakao`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ authCode: code }),
  });

  if (!response.ok) {
    return NextResponse.redirect(new URL('/login', baseUrl));
  }

  const json = await response.json();
  const { accessToken, refreshToken, registered } = json.data;

  const redirectUrl = registered ? '/hub' : '/login?terms=true';
  const redirectResponse = NextResponse.redirect(new URL(redirectUrl, baseUrl));

  redirectResponse.cookies.set(ACCESS_TOKEN_KEY, accessToken, ACCESS_COOKIE_OPTIONS);
  redirectResponse.cookies.set(REFRESH_TOKEN_KEY, refreshToken, REFRESH_COOKIE_OPTIONS);

  return redirectResponse;
}
