import { NextRequest, NextResponse } from 'next/server';

import {
  ACCESS_COOKIE_OPTIONS,
  ACCESS_TOKEN_KEY,
  REFRESH_COOKIE_OPTIONS,
  REFRESH_TOKEN_KEY,
} from '@/lib/apis/cookies';

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

  const redirectUrl = registered ? '/hub' : '/login?terms=true';
  const redirectResponse = NextResponse.redirect(new URL(redirectUrl, appUrl));

  // 프론트 쿠키 체계로 변환하여 설정
  if (rawAccessToken) {
    const accessToken = rawAccessToken.replace(/^Bearer\s+/i, '').trim();
    if (accessToken) {
      redirectResponse.cookies.set(ACCESS_TOKEN_KEY, accessToken, ACCESS_COOKIE_OPTIONS);
    }
    // 백엔드가 설정한 쿠키 삭제
    redirectResponse.cookies.delete('Authorization');
  }

  if (rawRefreshToken) {
    const refreshToken = rawRefreshToken.replace(/^Bearer\s+/i, '').trim();
    if (refreshToken) {
      redirectResponse.cookies.set(REFRESH_TOKEN_KEY, refreshToken, REFRESH_COOKIE_OPTIONS);
    }
    redirectResponse.cookies.delete('Authorization_refresh');
  }

  if (name) {
    redirectResponse.cookies.set('userName', name, {
      path: '/',
      maxAge: 60 * 5,
    });
  }

  return redirectResponse;
}
