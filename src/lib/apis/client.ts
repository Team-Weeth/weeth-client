import * as Sentry from '@sentry/nextjs';
import axios from 'axios';
import { getAppOriginServerFallback } from '@/utils/shared/url';

function getProxyBaseUrl(path: string) {
  if (typeof window !== 'undefined') {
    return path;
  }

  return `${getAppOriginServerFallback()}${path}`;
}

export const apiClient = axios.create({
  baseURL: getProxyBaseUrl('/api/proxy'),
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export const apiClientV1 = axios.create({
  baseURL: getProxyBaseUrl('/api/proxy-v1'),
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// 동시 요청 시 refresh 중복 호출 방지용
let refreshPromise: Promise<void> | null = null;

const refreshTokens = async () => {
  await apiClient.post('/auth/refresh');
};

// Response: 401 시 refresh → 재시도
const createAuthInterceptor = (client: typeof apiClient) => {
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (!refreshPromise) {
          refreshPromise = refreshTokens();
        }

        try {
          await refreshPromise;
          refreshPromise = null;
          return client(originalRequest);
        } catch {
          refreshPromise = null;
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
      }

      if (error.response?.status >= 500) {
        Sentry.captureException(error, {
          extra: {
            status: error.response.status,
            url: originalRequest?.url,
            method: originalRequest?.method,
          },
        });
      }

      return Promise.reject(error);
    },
  );
};

createAuthInterceptor(apiClient);
createAuthInterceptor(apiClientV1);
