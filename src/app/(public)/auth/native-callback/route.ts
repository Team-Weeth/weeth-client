import { NextRequest, NextResponse } from 'next/server';

import { verifyNativeBridgeToken } from '@/lib/auth/nativeBridgeToken';
import {
  ACCESS_COOKIE_OPTIONS,
  ACCESS_TOKEN_KEY,
  REFRESH_COOKIE_OPTIONS,
  REFRESH_TOKEN_KEY,
} from '@/lib/apis/cookies';

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const token = request.nextUrl.searchParams.get('t');

  if (!token) {
    return NextResponse.redirect(new URL('/login', appUrl));
  }

  const payload = verifyNativeBridgeToken(token);

  if (!payload) {
    return NextResponse.redirect(new URL('/login', appUrl));
  }

  const redirectResponse = NextResponse.redirect(new URL(payload.redirectUrl, appUrl));

  redirectResponse.cookies.set(ACCESS_TOKEN_KEY, payload.accessToken, ACCESS_COOKIE_OPTIONS);
  redirectResponse.cookies.set(REFRESH_TOKEN_KEY, payload.refreshToken, REFRESH_COOKIE_OPTIONS);

  if (payload.name) {
    redirectResponse.cookies.set('userName', payload.name, {
      path: '/',
      maxAge: 60 * 5,
    });
  }

  return redirectResponse;
}
