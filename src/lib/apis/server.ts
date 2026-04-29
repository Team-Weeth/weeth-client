import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { API_BASE_PATH } from '@/constants/api';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from './cookies';

interface RequestOptions extends Omit<RequestInit, 'method' | 'body'> {
  params?: Record<string, string | number>;
}

export class ApiError extends Error {
  status: number;
  code: number;

  constructor(status: number, code: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

function isErrorResponse(value: unknown): value is {
  message?: string;
  code?: number;
} {
  return typeof value === 'object' && value !== null;
}

function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = `${API_BASE_PATH}${path}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.set(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }
  return url;
}

async function redirectToRefresh(): Promise<never> {
  const headerStore = await headers();
  const pathname = headerStore.get('x-pathname') ?? '/hub';
  const search = headerStore.get('x-search') ?? '';
  const redirectPath = `${pathname}${search}`;
  redirect(`/api/proxy/auth/refresh?redirect=${encodeURIComponent(redirectPath)}`);
}

async function refreshTokens(cookieStore: Awaited<ReturnType<typeof cookies>>): Promise<never> {
  const refreshToken = cookieStore.get(REFRESH_TOKEN_KEY)?.value;

  if (!refreshToken) {
    redirect('/login');
  }
  return redirectToRefresh();
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
  _retried = false,
): Promise<T> {
  const cookieStore = await cookies();
  const accessToken =
    cookieStore.get(ACCESS_TOKEN_KEY)?.value ??
    (process.env.NODE_ENV === 'development' ? process.env.DEV_ACCESS_TOKEN : undefined);
  const refreshToken = cookieStore.get(REFRESH_TOKEN_KEY)?.value;

  // If only the refresh token remains, refresh first so the initial SSR request
  // doesn't incur an avoidable 401 -> retry round trip.
  if (!accessToken && refreshToken) {
    await refreshTokens(cookieStore);
  }

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
    const errorBody = await response.text();
    const responsePreview = errorBody.length > 200 ? `${errorBody.slice(0, 200)}...` : errorBody;
    console.error('apiServer request failed:', {
      method,
      url,
      status: response.status,
      statusText: response.statusText,
      responseBodyPreview: responsePreview,
    });
    let serverMessage: string | undefined;
    let serverCode = 0;
    try {
      const parsed: unknown = JSON.parse(errorBody);
      if (isErrorResponse(parsed)) {
        serverMessage = typeof parsed.message === 'string' ? parsed.message : undefined;
        serverCode = typeof parsed.code === 'number' ? parsed.code : 0;
      }
    } catch {
      // not JSON
    }
    throw new ApiError(
      response.status,
      serverCode,
      serverMessage ?? `API Error: ${response.status} ${response.statusText}`,
    );
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
