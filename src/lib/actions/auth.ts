'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { API_BASE_PATH } from '@/constants/api';
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  ACCESS_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
} from '@/lib/apis/cookies';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const response = await fetch(`${API_BASE_PATH}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    return { error: error?.message ?? '로그인에 실패했습니다.' };
  }

  const json = await response.json();
  const { accessToken, refreshToken } = json.data;

  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_KEY, accessToken, ACCESS_COOKIE_OPTIONS);
  cookieStore.set(REFRESH_TOKEN_KEY, refreshToken, REFRESH_COOKIE_OPTIONS);

  redirect('/home');
}

export async function agreeTermsAction(intent?: string, clubId?: string, code?: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_KEY)?.value;

  const response = await fetch(`${API_BASE_PATH}/users/terms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ termsAgreed: true, privacyAgreed: true }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    return { error: error?.message ?? '약관 동의에 실패했습니다.' };
  }

  const json = await response.json();
  const { accessToken: newAccessToken, refreshToken } = json.data;

  cookieStore.set(ACCESS_TOKEN_KEY, newAccessToken, ACCESS_COOKIE_OPTIONS);
  cookieStore.set(REFRESH_TOKEN_KEY, refreshToken, REFRESH_COOKIE_OPTIONS);

  if (intent === 'join' && clubId && code) {
    redirect(`/joining?clubId=${clubId}&code=${code}`);
  }
  if (intent === 'join-no-code' && clubId) {
    redirect(`/club/join?clubId=${clubId}`);
  }
  redirect(intent ? `/hub?intent=${intent}` : '/hub');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_KEY);
  cookieStore.delete(REFRESH_TOKEN_KEY);

  redirect('/login');
}
