import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_PATH } from '@/constants/api';
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  ACCESS_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
} from '@/lib/apis/cookies';

function buildLoginResponse(appUrl: string) {
  const response = NextResponse.redirect(new URL('/login', appUrl));
  response.cookies.delete(ACCESS_TOKEN_KEY);
  response.cookies.delete(REFRESH_TOKEN_KEY);
  return response;
}

async function requestRefresh(refreshToken: string) {
  return fetch(`${API_BASE_PATH}/users/social/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization_refresh: `Bearer ${refreshToken}`,
    },
  });
}

async function logRefreshResponse(scope: 'GET' | 'POST', response: Response) {
  let responseBodyPreview = '';

  try {
    const raw = await response.clone().text();
    responseBodyPreview = raw.length > 200 ? `${raw.slice(0, 200)}...` : raw;
  } catch {
    responseBodyPreview = '[unreadable response body]';
  }

  console.log(`[refresh-route][${scope}] backend refresh response`, {
    status: response.status,
    ok: response.ok,
    responseBodyPreview,
  });
}

export async function POST() {
  try {
    if (!API_BASE_PATH) {
      const response = NextResponse.json({ error: 'API URL not configured' }, { status: 500 });
      response.cookies.delete(ACCESS_TOKEN_KEY);
      response.cookies.delete(REFRESH_TOKEN_KEY);
      return response;
    }

    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_TOKEN_KEY)?.value;
    console.log('[refresh-route][POST] start', {
      hasRefreshToken: !!refreshToken,
    });

    if (!refreshToken) {
      console.log('[refresh-route][POST] missing refresh token');
      const response = NextResponse.json({ error: 'No refresh token' }, { status: 401 });
      response.cookies.delete(ACCESS_TOKEN_KEY);
      response.cookies.delete(REFRESH_TOKEN_KEY);
      return response;
    }

    const response = await requestRefresh(refreshToken);
    await logRefreshResponse('POST', response);

    if (!response.ok) {
      cookieStore.delete(ACCESS_TOKEN_KEY);
      cookieStore.delete(REFRESH_TOKEN_KEY);
      console.log('[refresh-route][POST] refresh failed -> cleared cookies');
      return NextResponse.json({ error: 'Refresh failed' }, { status: 401 });
    }

    const json = await response.json();
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = json.data;

    cookieStore.set(ACCESS_TOKEN_KEY, newAccessToken, ACCESS_COOKIE_OPTIONS);
    cookieStore.set(REFRESH_TOKEN_KEY, newRefreshToken, REFRESH_COOKIE_OPTIONS);
    console.log('[refresh-route][POST] refresh success -> cookies updated');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[refresh-route][POST] unexpected error', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    response.cookies.delete(ACCESS_TOKEN_KEY);
    response.cookies.delete(REFRESH_TOKEN_KEY);
    return response;
  }
}

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const redirectPath = request.nextUrl.searchParams.get('redirect');
  const safeRedirect =
    redirectPath && redirectPath.startsWith('/') && !redirectPath.startsWith('//')
      ? redirectPath
      : '/hub';

  try {
    if (!API_BASE_PATH) {
      return buildLoginResponse(appUrl);
    }

    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_TOKEN_KEY)?.value;
    console.log('[refresh-route][GET] start', {
      hasRefreshToken: !!refreshToken,
      redirect: safeRedirect,
    });

    if (!refreshToken) {
      console.log('[refresh-route][GET] missing refresh token');
      return buildLoginResponse(appUrl);
    }

    const response = await requestRefresh(refreshToken);
    await logRefreshResponse('GET', response);

    if (!response.ok) {
      console.log('[refresh-route][GET] refresh failed -> cleared cookies, redirect login');
      return buildLoginResponse(appUrl);
    }

    const json = await response.json();
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = json.data;

    const redirectResponse = NextResponse.redirect(new URL(safeRedirect, appUrl));
    redirectResponse.cookies.set(ACCESS_TOKEN_KEY, newAccessToken, ACCESS_COOKIE_OPTIONS);
    redirectResponse.cookies.set(REFRESH_TOKEN_KEY, newRefreshToken, REFRESH_COOKIE_OPTIONS);
    console.log('[refresh-route][GET] refresh success -> cookies updated, redirecting back');
    return redirectResponse;
  } catch (error) {
    console.error('[refresh-route][GET] unexpected error', error);
    return buildLoginResponse(appUrl);
  }
}
