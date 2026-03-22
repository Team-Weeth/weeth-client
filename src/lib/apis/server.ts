import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { BASE_URL } from '@/constants';
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  ACCESS_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
} from './cookies';

interface RequestOptions extends Omit<RequestInit, 'method' | 'body'> {
  params?: Record<string, string | number>;
}

function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = `${BASE_URL}${path}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.set(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }
  return url;
}

async function refreshTokens(cookieStore: Awaited<ReturnType<typeof cookies>>): Promise<void> {
  const refreshToken = cookieStore.get(REFRESH_TOKEN_KEY)?.value;

  if (!refreshToken) {
    redirect('/login');
  }

  const refreshResponse = await fetch(`${BASE_URL}/api/v4/users/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization_refresh: `Bearer ${refreshToken}`,
    },
  });

  if (!refreshResponse.ok) {
    cookieStore.delete(ACCESS_TOKEN_KEY);
    cookieStore.delete(REFRESH_TOKEN_KEY);
    redirect('/login');
  }

  const refreshJson = await refreshResponse.json();
  const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshJson.data;

  cookieStore.set(ACCESS_TOKEN_KEY, newAccessToken, ACCESS_COOKIE_OPTIONS);
  cookieStore.set(REFRESH_TOKEN_KEY, newRefreshToken, REFRESH_COOKIE_OPTIONS);
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
  _retried = false,
): Promise<T> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_KEY)?.value;

  const { params, ...fetchOptions } = options;
  const url = buildUrl(path, params);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...fetchOptions.headers,
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    ...fetchOptions,
  });

  if (response.status === 401) {
    if (_retried) {
      redirect('/login');
    }

    await refreshTokens(cookieStore);
    return request<T>(method, path, body, options, true);
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const apiServer = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, body, options),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>('DELETE', path, undefined, options),
};
