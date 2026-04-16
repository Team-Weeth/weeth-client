import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_TOKEN_KEY } from '@/lib/apis/cookies';

const PUBLIC_PATHS = ['/', '/login', '/terms', '/landing'];

// TODO: 런칭 후 PRE_LAUNCH 플래그 및 관련 분기 제거
const PRE_LAUNCH = false;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // TODO: 진단 후 제거
  console.log('[proxy-debug]', {
    pathname,
    appEnv: process.env.NEXT_PUBLIC_APP_ENV,
    hasPreviewToken: !!process.env.PREVIEW_ACCESS_TOKEN,
    hasAccessCookie: request.cookies.has(ACCESS_TOKEN_KEY),
  });

  // 런칭 전: /landing 외 모든 경로 차단
  if (PRE_LAUNCH && pathname !== '/landing') {
    const url = request.nextUrl.clone();
    url.pathname = '/landing';
    url.searchParams.set('blocked', 'true');
    return NextResponse.redirect(url);
  }

  // /clubId=XXX 패턴 → /club/XXX로 리다이렉트 (초대 링크)
  const clubIdMatch = pathname.match(/^\/clubId=([^?/]+)/);
  if (clubIdMatch) {
    const clubId = clubIdMatch[1];
    const url = new URL(`/club/${clubId}`, request.url);
    url.search = request.nextUrl.search;
    return NextResponse.redirect(url);
  }

  // 개발 배포 환경에서 토큰 자동 주입 (카카오/애플 로그인 없이 페이지 접근)
  // Amplify/Vercel 환경변수에 NEXT_PUBLIC_APP_ENV를 브랜치별로 등록해야 함
  // - develop 브랜치 배포: NEXT_PUBLIC_APP_ENV=development
  // - main 브랜치 배포: NEXT_PUBLIC_APP_ENV=production
  const isPreview = process.env.NEXT_PUBLIC_APP_ENV !== 'production';
  const previewToken = process.env.PREVIEW_ACCESS_TOKEN;

  if (isPreview && previewToken && !request.cookies.has(ACCESS_TOKEN_KEY)) {
    request.cookies.set(ACCESS_TOKEN_KEY, previewToken);

    const response = NextResponse.next({ request });
    response.cookies.set(ACCESS_TOKEN_KEY, previewToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  }

  if (
    PUBLIC_PATHS.some((path) => pathname === path) ||
    pathname.startsWith('/club/') ||
    pathname.startsWith('/kakao/') ||
    pathname === '/apple/oauth'
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value;

  if (!accessToken) {
    const clubId = process.env.CLUB_ID;
    if (clubId) {
      return NextResponse.redirect(new URL(`/club/${clubId}`, request.url));
    }
    const loginUrl = new URL('/login', request.url);
    const redirect = request.nextUrl.search ? `${pathname}${request.nextUrl.search}` : pathname;
    loginUrl.searchParams.set('redirect', redirect);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|icons|videos|api|favicon\\.ico).*)'],
};
