import { http, HttpResponse } from 'msw';
import { NextRequest } from 'next/server';

import { server } from '@/mocks/server';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/apis/cookies';
import { APPLE_PENDING_STATE_KEY } from '@/constants/apple';

import { GET } from '../route';

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
}));

jest.mock('@/lib/auth/nativeBridgeToken', () => ({
  signNativeBridgeToken: jest.fn(() => 'mock-bridge-token'),
}));

function createRequest(url: string, cookies?: Record<string, string>) {
  const request = new NextRequest(new URL(url, 'http://localhost:3000'));
  if (cookies) {
    for (const [key, value] of Object.entries(cookies)) {
      request.cookies.set(key, value);
    }
  }
  return request;
}

function getRedirectLocation(response: Response) {
  return response.headers.get('location') ?? '';
}

function getSetCookies(response: Response) {
  const raw = response.headers.getSetCookie();
  const result: Record<string, string> = {};
  for (const cookie of raw) {
    const [pair] = cookie.split(';');
    const [name, ...rest] = pair.split('=');
    result[name.trim()] = rest.join('=').trim();
  }
  return result;
}

function mockAppleApiSuccess(overrides?: Record<string, unknown>) {
  server.use(
    http.post('*/users/social/apple', () =>
      HttpResponse.json({
        data: {
          accessToken: 'apple-access-token',
          refreshToken: 'apple-refresh-token',
          registered: true,
          name: '홍길동',
          ...overrides,
        },
      }),
    ),
  );
}

function mockAppleApiFailure(status = 401) {
  server.use(http.post('*/users/social/apple', () => new HttpResponse(null, { status })));
}

describe('Apple OAuth route handler', () => {
  describe('error 파라미터', () => {
    it('error가 있으면 /login으로 리다이렉트', async () => {
      const response = await GET(createRequest('/apple/oauth?error=access_denied'));
      expect(getRedirectLocation(response)).toContain('/login');
    });
  });

  describe('code 플로우 (앱 WebView)', () => {
    it('code로 백엔드 호출 후 토큰 쿠키를 설정하고 /hub로 리다이렉트', async () => {
      mockAppleApiSuccess();

      const response = await GET(createRequest('/apple/oauth?code=auth_code_123'));
      const location = getRedirectLocation(response);
      const cookies = getSetCookies(response);

      expect(location).toContain('/hub');
      expect(cookies[ACCESS_TOKEN_KEY]).toBe('apple-access-token');
      expect(cookies[REFRESH_TOKEN_KEY]).toBe('apple-refresh-token');
    });

    it('미등록 사용자는 /login?terms=true로 리다이렉트', async () => {
      mockAppleApiSuccess({ registered: false });

      const response = await GET(createRequest('/apple/oauth?code=auth_code_123'));
      const location = getRedirectLocation(response);

      expect(location).toContain('/login');
      expect(location).toContain('terms=true');
    });

    it('백엔드 API 실패 시 /login으로 리다이렉트', async () => {
      mockAppleApiFailure();

      const response = await GET(createRequest('/apple/oauth?code=auth_code_123'));
      expect(getRedirectLocation(response)).toContain('/login');
    });

    it('백엔드 응답에 토큰이 없으면 /login으로 리다이렉트', async () => {
      mockAppleApiSuccess({ accessToken: null, refreshToken: null });

      const response = await GET(createRequest('/apple/oauth?code=auth_code_123'));
      expect(getRedirectLocation(response)).toContain('/login');
    });

    it('state 쿼리 파라미터로 로그인 의도를 복원 (join)', async () => {
      mockAppleApiSuccess();

      const state = 'join:club123:invite456';
      const response = await GET(createRequest(`/apple/oauth?code=auth_code_123&state=${state}`));
      const location = getRedirectLocation(response);

      expect(location).toContain('/joining');
      expect(location).toContain('clubId=club123');
      expect(location).toContain('code=invite456');
    });

    it('state 쿼리 파라미터로 로그인 의도를 복원 (join-no-code)', async () => {
      mockAppleApiSuccess();

      const state = 'join-no-code:club123';
      const response = await GET(createRequest(`/apple/oauth?code=auth_code_123&state=${state}`));
      const location = getRedirectLocation(response);

      expect(location).toContain('/club/join');
    });

    it('state 쿼리 파라미터로 redirect 경로를 복원', async () => {
      mockAppleApiSuccess();

      const state = encodeURIComponent('/my/page');
      const response = await GET(createRequest(`/apple/oauth?code=auth_code_123&state=${state}`));
      const location = getRedirectLocation(response);

      expect(location).toContain('/my/page');
    });

    it('name이 있으면 userName 쿠키를 설정', async () => {
      mockAppleApiSuccess({ name: '테스트유저' });

      const response = await GET(createRequest('/apple/oauth?code=auth_code_123'));
      const cookies = getSetCookies(response);

      expect(decodeURIComponent(cookies['userName'])).toBe('테스트유저');
    });

    it('name이 없으면 userName 쿠키를 설정하지 않음', async () => {
      mockAppleApiSuccess({ name: null });

      const response = await GET(createRequest('/apple/oauth?code=auth_code_123'));
      const cookies = getSetCookies(response);

      expect(cookies['userName']).toBeUndefined();
    });
  });

  describe('네이티브 앱 분기', () => {
    it('state에 native: 접두사가 있으면 bridge token으로 리다이렉트', async () => {
      mockAppleApiSuccess();

      const response = await GET(createRequest('/apple/oauth?code=auth_code_123&state=native:'));
      const location = getRedirectLocation(response);

      expect(location).toContain('kr.weeth.client://auth/callback');
      expect(location).toContain('t=mock-bridge-token');
    });

    it('네이티브 + join 의도', async () => {
      const { signNativeBridgeToken } = jest.requireMock('@/lib/auth/nativeBridgeToken');
      mockAppleApiSuccess();

      const state = 'native:join:club1:code1';
      const response = await GET(createRequest(`/apple/oauth?code=auth_code_123&state=${state}`));

      expect(getRedirectLocation(response)).toContain('kr.weeth.client://auth/callback');
      expect(signNativeBridgeToken).toHaveBeenCalledWith(
        expect.objectContaining({
          accessToken: 'apple-access-token',
          refreshToken: 'apple-refresh-token',
          redirectUrl: expect.stringContaining('/joining'),
        }),
      );
    });
  });

  describe('기존 플로우 (Set-Cookie 방식)', () => {
    it('Authorization 쿠키에서 Bearer prefix를 제거하고 토큰 쿠키를 설정', async () => {
      const response = await GET(
        createRequest('/apple/oauth?registered=true', {
          Authorization: 'Bearer legacy-access-token',
          Authorization_refresh: 'Bearer legacy-refresh-token',
        }),
      );
      const location = getRedirectLocation(response);
      const cookies = getSetCookies(response);

      expect(location).toContain('/hub');
      expect(cookies[ACCESS_TOKEN_KEY]).toBe('legacy-access-token');
      expect(cookies[REFRESH_TOKEN_KEY]).toBe('legacy-refresh-token');
    });

    it('쿠키에서 state를 읽어 로그인 의도를 복원', async () => {
      const pendingState = encodeURIComponent('join:club1:code1');
      const response = await GET(
        createRequest('/apple/oauth?registered=true', {
          Authorization: 'Bearer access',
          Authorization_refresh: 'Bearer refresh',
          [APPLE_PENDING_STATE_KEY]: pendingState,
        }),
      );
      const location = getRedirectLocation(response);

      expect(location).toContain('/joining');
    });

    it('Authorization 쿠키가 없으면 /login으로 리다이렉트', async () => {
      const response = await GET(createRequest('/apple/oauth?registered=true'));
      expect(getRedirectLocation(response)).toContain('/login');
    });

    it('pending state 쿠키를 사용 후 삭제', async () => {
      const response = await GET(
        createRequest('/apple/oauth?registered=true', {
          Authorization: 'Bearer access',
          Authorization_refresh: 'Bearer refresh',
          [APPLE_PENDING_STATE_KEY]: 'some-state',
        }),
      );
      const cookies = getSetCookies(response);

      expect(cookies[APPLE_PENDING_STATE_KEY]).toBe('');
    });
  });

  describe('state 우선순위', () => {
    it('쿼리 파라미터 state가 쿠키 state보다 우선', async () => {
      mockAppleApiSuccess();

      const response = await GET(
        createRequest('/apple/oauth?code=auth_code&state=join-no-code:fromQuery', {
          [APPLE_PENDING_STATE_KEY]: encodeURIComponent('join-no-code:fromCookie'),
        }),
      );
      const location = getRedirectLocation(response);

      expect(location).toContain('/club/join');
    });
  });
});
