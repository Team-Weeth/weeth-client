import { NextResponse } from 'next/server';
import { API_BASE_PATH } from '@/constants/api';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from './cookies';

interface RefreshedTokens {
  accessToken: string;
  refreshToken: string;
}

interface TokenRefreshResult {
  response: Response;
  tokens: RefreshedTokens | null;
}

async function requestTokenRefreshWithResponse(
  refreshToken: string,
): Promise<TokenRefreshResult | null> {
  try {
    const response = await fetch(`${API_BASE_PATH}/users/social/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization_refresh: `Bearer ${refreshToken}`,
      },
    });

    let tokens: RefreshedTokens | null = null;

    if (response.ok) {
      const json = (await response.clone().json()) as {
        data?: { accessToken?: string; refreshToken?: string };
      };

      const accessToken = json.data?.accessToken;
      const nextRefreshToken = json.data?.refreshToken;

      if (accessToken && nextRefreshToken) {
        tokens = {
          accessToken,
          refreshToken: nextRefreshToken,
        };
      }
    }

    return {
      response,
      tokens,
    };
  } catch {
    return null;
  }
}

async function requestTokenRefresh(refreshToken: string): Promise<RefreshedTokens | null> {
  const result = await requestTokenRefreshWithResponse(refreshToken);
  return result?.tokens ?? null;
}

function clearAuthCookies(response: NextResponse) {
  response.cookies.delete(ACCESS_TOKEN_KEY);
  response.cookies.delete(REFRESH_TOKEN_KEY);
  return response;
}

export {
  clearAuthCookies,
  requestTokenRefresh,
  requestTokenRefreshWithResponse,
  type RefreshedTokens,
};
