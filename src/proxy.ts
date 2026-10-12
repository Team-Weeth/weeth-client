import { NextRequest, NextResponse } from 'next/server';
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  ACCESS_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
} from '@/lib/apis/cookies';
import { clearAuthCookies, requestTokenRefresh, type RefreshedTokens } from '@/lib/apis/refresh';

const PUBLIC_PATHS = ['/', '/login', '/terms', '/landing'];
const PRIVATE_PATHS = ['/hub', '/joining', '/welcome'];

// TODO: 런칭 후 PRE_LAUNCH 플래그 및 관련 분기 제거
const PRE_LAUNCH = false;

function buildLoginRedirectUrl(request: NextRequest, includeRedirect: boolean) {
  const loginUrl = new URL('/login', request.url);
  const { pathname, search } = request.nextUrl;
  if (includeRedirect && pathname !== '/login') {
    const redirect = search ? `${pathname}${search}` : pathname;
    loginUrl.searchParams.set('redirect', redirect);
  }
  return loginUrl;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  const hasAccessToken = request.cookies.has(ACCESS_TOKEN_KEY);
  const hasRefreshToken = request.cookies.has(REFRESH_TOKEN_KEY);

  // 개발 배포 환경에서 토큰 자동 주입 (카카오/애플 로그인 없이 페이지 접근)
  const isPreview = process.env.NEXT_PUBLIC_APP_ENV !== 'production';
  const previewToken = process.env.PREVIEW_ACCESS_TOKEN;
  if (isPreview && previewToken && !hasAccessToken && !hasRefreshToken) {
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

  const isPublicPath =
    PUBLIC_PATHS.some((path) => pathname === path) ||
    pathname.startsWith('/club/') ||
    pathname.startsWith('/kakao/') ||
    pathname === '/apple/oauth';

  if (isPublicPath) {
    return NextResponse.next();
  }

  const isPrivatePath = PRIVATE_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const isClubRoute = /^\/[A-Za-z0-9]+(?:\/|$)/.test(pathname);
  if (isClubRoute && !isPrivatePath) {
    // 액세스 토큰만 만료된 경우 여기서 갱신한다.
    // 서버 컴포넌트(apiServer)에서 갱신하면 라우트 핸들러로 redirect해야 하는데,
    // 클라이언트 내비게이션 중에는 라우터가 RSC 페이로드 대신 그 응답을 받아
    // "An unexpected response was received from the server."로 깨진다.
    let refreshed: RefreshedTokens | null = null;
    let refreshFailed = false;

    if (!hasAccessToken && hasRefreshToken) {
      refreshed = await requestTokenRefresh(request.cookies.get(REFRESH_TOKEN_KEY)!.value);

      if (refreshed) {
        request.cookies.set(ACCESS_TOKEN_KEY, refreshed.accessToken);
      } else {
        // 죽은 토큰을 지워야 ClubLayout이 로그인 안내 화면을 그린다
        refreshFailed = true;
        request.cookies.delete(ACCESS_TOKEN_KEY);
        request.cookies.delete(REFRESH_TOKEN_KEY);
      }
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-pathname', pathname);
    requestHeaders.set('x-search', request.nextUrl.search);

    const response = NextResponse.next({ request: { headers: requestHeaders } });

    if (refreshed) {
      response.cookies.set(ACCESS_TOKEN_KEY, refreshed.accessToken, ACCESS_COOKIE_OPTIONS);
      response.cookies.set(REFRESH_TOKEN_KEY, refreshed.refreshToken, REFRESH_COOKIE_OPTIONS);
    } else if (refreshFailed) {
      clearAuthCookies(response);
    }

    return response;
  }

  const requiresAuth = isPrivatePath;

  if (!requiresAuth) {
    return NextResponse.next();
  }

  // 액세스 토큰 있으면 통과
  if (hasAccessToken) {
    return NextResponse.next();
  }

  // 액세스 토큰 없고 리프레시 토큰만 있을 때 → 자동 갱신
  if (hasRefreshToken) {
    const refreshToken = request.cookies.get(REFRESH_TOKEN_KEY)!.value;
    const newTokens = await requestTokenRefresh(refreshToken);

    if (newTokens) {
      request.cookies.set(ACCESS_TOKEN_KEY, newTokens.accessToken);
      const response = NextResponse.next({ request });
      response.cookies.set(ACCESS_TOKEN_KEY, newTokens.accessToken, ACCESS_COOKIE_OPTIONS);
      response.cookies.set(REFRESH_TOKEN_KEY, newTokens.refreshToken, REFRESH_COOKIE_OPTIONS);
      return response;
    }

    // 갱신 실패 → 쿠키 정리 후 원래 경로를 유지한 채 로그인 페이지로
    return clearAuthCookies(NextResponse.redirect(buildLoginRedirectUrl(request, true)));
  }

  // 토큰 없음 → 로그인 페이지로
  return NextResponse.redirect(buildLoginRedirectUrl(request, true));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|icons|videos|api|favicon\\.ico).*)'],
};
