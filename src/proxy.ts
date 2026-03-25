import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_TOKEN_KEY } from '@/lib/apis/cookies';

const PUBLIC_PATHS = ['/', '/login', '/signup', '/landing'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Preview 환경에서 토큰 자동 주입
  const isPreview = process.env.VERCEL_ENV === 'preview';
  const previewToken = process.env.PREVIEW_ACCESS_TOKEN;

  if (isPreview && previewToken && !request.cookies.has(ACCESS_TOKEN_KEY)) {
    const response = NextResponse.next();
    response.cookies.set(ACCESS_TOKEN_KEY, previewToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  }

  if (PUBLIC_PATHS.some((path) => pathname === path)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value;

  if (!accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|icons|api|favicon\\.ico).*)'],
};
