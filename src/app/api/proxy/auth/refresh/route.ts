import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { BASE_URL } from '@/constants';
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  ACCESS_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
} from '@/lib/apis/cookies';

export async function POST() {
  try {
    if (!BASE_URL) {
      return NextResponse.json({ error: 'API URL not configured' }, { status: 500 });
    }

    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_TOKEN_KEY)?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
    }

    const response = await fetch(`${BASE_URL}/api/v4/users/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization_refresh: `Bearer ${refreshToken}`,
      },
    });

    if (!response.ok) {
      cookieStore.delete(ACCESS_TOKEN_KEY);
      cookieStore.delete(REFRESH_TOKEN_KEY);
      return NextResponse.json({ error: 'Refresh failed' }, { status: 401 });
    }

    const json = await response.json();
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = json.data;

    cookieStore.set(ACCESS_TOKEN_KEY, newAccessToken, ACCESS_COOKIE_OPTIONS);
    cookieStore.set(REFRESH_TOKEN_KEY, newRefreshToken, REFRESH_COOKIE_OPTIONS);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
