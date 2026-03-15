export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export const ACCESS_COOKIE_OPTIONS = {
  ...COOKIE_BASE,
  maxAge: 60 * 60 * 2, // 2시간
};

export const REFRESH_COOKIE_OPTIONS = {
  ...COOKIE_BASE,
  maxAge: 60 * 60 * 24 * 7, // 7일
};
