import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_PATH } from '@/constants/api';
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  ACCESS_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
} from '@/lib/apis/cookies';
import {
  buildRefreshResponsePreview,
  clearAuthCookies,
  requestTokenRefreshWithResponse,
} from '@/lib/apis/refresh';

function buildLoginResponse(appUrl: string, redirectPath?: string) {
  const loginUrl = new URL('/login', appUrl);
  if (redirectPath) {
    loginUrl.searchParams.set('redirect', redirectPath);
  }
  return clearAuthCookies(NextResponse.redirect(loginUrl));
}

async function logRefreshResponse(scope: 'GET' | 'POST', response: Response) {
  const responseBodyPreview = await buildRefreshResponsePreview(response);

  console.log(`[refresh-route][${scope}] backend refresh response`, {
    status: response.status,
    ok: response.ok,
    responseBodyPreview,
  });
}

export async function POST() {
  try {
    if (!API_BASE_PATH) {
      return clearAuthCookies(
        NextResponse.json({ error: 'API URL not configured' }, { status: 500 }),
      );
    }

    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_TOKEN_KEY)?.value;
    console.log('[refresh-route][POST] start', {
      hasRefreshToken: !!refreshToken,
    });

    if (!refreshToken) {
      console.log('[refresh-route][POST] missing refresh token');
      return clearAuthCookies(NextResponse.json({ error: 'No refresh token' }, { status: 401 }));
    }

    const refreshResult = await requestTokenRefreshWithResponse(refreshToken);

    if (!refreshResult) {
      console.log('[refresh-route][POST] refresh failed -> request error');
      return clearAuthCookies(NextResponse.json({ error: 'Refresh failed' }, { status: 401 }));
    }

    await logRefreshResponse('POST', refreshResult.response);

    if (!refreshResult.tokens) {
      console.log('[refresh-route][POST] refresh failed -> cleared cookies');
      return clearAuthCookies(NextResponse.json({ error: 'Refresh failed' }, { status: 401 }));
    }

    cookieStore.set(ACCESS_TOKEN_KEY, refreshResult.tokens.accessToken, ACCESS_COOKIE_OPTIONS);
    cookieStore.set(REFRESH_TOKEN_KEY, refreshResult.tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
    console.log('[refresh-route][POST] refresh success -> cookies updated');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[refresh-route][POST] unexpected error', error);
    return clearAuthCookies(NextResponse.json({ error: 'Internal server error' }, { status: 500 }));
  }
}

export async function GET(request: NextRequest) {
  const appUrl = request.nextUrl.origin;
  const redirectPath = request.nextUrl.searchParams.get('redirect');
  const safeRedirect =
    redirectPath && redirectPath.startsWith('/') && !redirectPath.startsWith('//')
      ? redirectPath
      : '/hub';

  try {
    if (!API_BASE_PATH) {
      return buildLoginResponse(appUrl, safeRedirect);
    }

    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_TOKEN_KEY)?.value;
    console.log('[refresh-route][GET] start', {
      hasRefreshToken: !!refreshToken,
      redirect: safeRedirect,
    });

    if (!refreshToken) {
      console.log('[refresh-route][GET] missing refresh token');
      return buildLoginResponse(appUrl, safeRedirect);
    }

    const refreshResult = await requestTokenRefreshWithResponse(refreshToken);

    if (!refreshResult) {
      console.log('[refresh-route][GET] refresh failed -> request error');
      return buildLoginResponse(appUrl, safeRedirect);
    }

    await logRefreshResponse('GET', refreshResult.response);

    if (!refreshResult.tokens) {
      console.log('[refresh-route][GET] refresh failed -> cleared cookies, redirect login');
      return buildLoginResponse(appUrl, safeRedirect);
    }

    const redirectResponse = NextResponse.redirect(new URL(safeRedirect, appUrl));
    redirectResponse.cookies.set(
      ACCESS_TOKEN_KEY,
      refreshResult.tokens.accessToken,
      ACCESS_COOKIE_OPTIONS,
    );
    redirectResponse.cookies.set(
      REFRESH_TOKEN_KEY,
      refreshResult.tokens.refreshToken,
      REFRESH_COOKIE_OPTIONS,
    );
    console.log('[refresh-route][GET] refresh success -> cookies updated, redirecting back');
    return redirectResponse;
  } catch (error) {
    console.error('[refresh-route][GET] unexpected error', error);
    return buildLoginResponse(appUrl, safeRedirect);
  }
}
