import { http, HttpResponse } from 'msw';

export const authHandlers = [
  http.post('/api/v1/non-member/sign-in', () => {
    return HttpResponse.json(
      {
        status: 200,
        message: '로그인 성공',
        data: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      },
      { status: 200 },
    );
  }),

  http.post('/api/v1/non-member/sign-up', () => {
    return HttpResponse.json(
      {
        status: 200,
        message: '회원가입 성공',
        data: null,
      },
      { status: 200 },
    );
  }),

  http.post('/api/v1/non-member/reissue', () => {
    return HttpResponse.json(
      {
        status: 200,
        message: '토큰 재발급 성공',
        data: {
          accessToken: 'mock-access-token-refreshed',
          refreshToken: 'mock-refresh-token-refreshed',
        },
      },
      { status: 200 },
    );
  }),
];
