/** @jest-environment node */

import { AxiosError, type AxiosAdapter } from 'axios';

jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn() }));

describe('인증 토큰 갱신', () => {
  let apiClient: typeof import('../client').apiClient;
  let apiClientV1: typeof import('../client').apiClientV1;
  const location = { href: '/home' };

  beforeEach(() => {
    jest.resetModules();
    location.href = '/home';
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { location },
    });
    ({ apiClient, apiClientV1 } = jest.requireActual('../client'));
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'window');
  });

  function mockResponses(refreshStatus: number, retryStatus = 200) {
    const adapter = jest.fn<ReturnType<AxiosAdapter>, Parameters<AxiosAdapter>>(async (config) => {
      const isRefresh = config.url === '/auth/refresh';
      const isRetry = (config as typeof config & { _retry?: boolean })._retry;
      const status = isRefresh ? refreshStatus : isRetry ? retryStatus : 401;
      const response = { data: {}, status, statusText: '', headers: {}, config };
      if (status >= 400) {
        throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, response);
      }
      return response;
    });
    apiClient.defaults.adapter = adapter;
    apiClientV1.defaults.adapter = adapter;
    return adapter;
  }

  it('갱신도 401이면 두 클라이언트의 대기 요청을 종료하고 로그인으로 이동한다', async () => {
    const adapter = mockResponses(401);

    const results = await Promise.allSettled([
      apiClient.get('/users/me'),
      apiClientV1.get('/users/me'),
    ]);

    expect(results.map((result) => result.status)).toEqual(['rejected', 'rejected']);
    expect(location.href).toBe('/login');
    expect(adapter.mock.calls.filter(([config]) => config.url === '/auth/refresh')).toHaveLength(1);
    expect(adapter).toHaveBeenCalledTimes(3);

    // 실패한 Promise가 남아 이후 갱신까지 막지 않아야 한다.
    mockResponses(200);
    await expect(apiClient.get('/users/me')).resolves.toMatchObject({ status: 200 });
  }, 1000);

  it('동시 401 요청은 한 번만 갱신하고 각 원래 요청을 재시도한다', async () => {
    const adapter = mockResponses(200);

    const results = await Promise.all([apiClient.get('/users/me'), apiClientV1.get('/users/me')]);

    expect(results.map((result) => result.status)).toEqual([200, 200]);
    expect(adapter.mock.calls.filter(([config]) => config.url === '/auth/refresh')).toHaveLength(1);
    expect(adapter).toHaveBeenCalledTimes(5);
    expect(location.href).toBe('/home');
  });

  it('갱신 후 재시도도 401이면 다시 갱신하지 않는다', async () => {
    const adapter = mockResponses(200, 401);

    await expect(apiClient.get('/users/me')).rejects.toMatchObject({ response: { status: 401 } });

    expect(adapter).toHaveBeenCalledTimes(3);
    expect(adapter.mock.calls.filter(([config]) => config.url === '/auth/refresh')).toHaveLength(1);
  });
});
