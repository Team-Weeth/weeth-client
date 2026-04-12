export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const CLUB_ID_KEY = 'club_id';
export const CLUB_NAME_KEY = 'club_name';

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

export const CLUB_COOKIE_OPTIONS = {
  ...COOKIE_BASE,
  maxAge: 60 * 60 * 24 * 7, // 7일 (refresh token과 동일)
};
