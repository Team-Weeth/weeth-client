import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const http = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// 동시 요청 시 refresh 중복 호출 방지용
let refreshTokenPromise: Promise<{
  newAccessToken: string;
  newRefreshToken: string;
}> | null = null;

const getRefreshToken = async () => {
  const response = await http.post('/api/v1/users/refresh');
  const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
    response.data.data;

  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
  }

  return { newAccessToken, newRefreshToken };
};

// Request: access token + refresh token 헤더 주입
http.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    if (refreshToken) {
      config.headers['Authorization_refresh'] = `Bearer ${refreshToken}`;
    }
  }
  return config;
});

// Response: 401 시 refresh token으로 갱신 후 재시도
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!refreshTokenPromise) {
        refreshTokenPromise = getRefreshToken();
      }

      try {
        const { newAccessToken, newRefreshToken } = await refreshTokenPromise;
        refreshTokenPromise = null;

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization_refresh'] =
          `Bearer ${newRefreshToken}`;

        return http(originalRequest);
      } catch {
        refreshTokenPromise = null;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);
