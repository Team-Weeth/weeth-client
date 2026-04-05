'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  ACCESS_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
} from '@/lib/apis/cookies';
import { authApi, type AgreeTermsResponse } from '@/lib/apis';
import { getPostLoginUrl } from '@/lib/auth/redirectPaths';

export async function agreeTermsAction(intent?: string, clubId?: string, code?: string, redirectPath?: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_KEY)?.value;

  if (!accessToken) {
    redirect('/login');
  }

  const response = await authApi.agreeTerms(accessToken);

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    return { error: error?.message ?? '약관 동의에 실패했습니다.' };
  }

  const json = (await response.json()) as AgreeTermsResponse;
  const { accessToken: newAccessToken, refreshToken } = json.data;

  if (!newAccessToken || !refreshToken) {
    return { error: '약관 동의 후 토큰을 확인할 수 없습니다.' };
  }

  cookieStore.set(ACCESS_TOKEN_KEY, newAccessToken, ACCESS_COOKIE_OPTIONS);
  cookieStore.set(REFRESH_TOKEN_KEY, refreshToken, REFRESH_COOKIE_OPTIONS);

  redirect(getPostLoginUrl({ intent, clubId, code, redirectPath }));
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_KEY);
  cookieStore.delete(REFRESH_TOKEN_KEY);

  redirect('/login');
}
