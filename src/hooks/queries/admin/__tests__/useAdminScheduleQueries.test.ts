import { renderHook, waitFor, act } from '@testing-library/react';
import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { adminScheduleApi } from '@/lib/apis/adminSchedule';
import { createQueryClient, createWrapper } from '@/test-utils/query';
import {
  isSessionForceRequiredError,
  useAdminMonthlySessionList,
  useCreateSchedule,
  useCreateSession,
  useUpdateSession,
  useDeleteSession,
  useDeleteSessionGroup,
  useUpdateSchedule,
  useDeleteSchedule,
} from '../useAdminScheduleQueries';

jest.mock('@/lib/apis/adminSchedule', () => ({
  adminScheduleApi: {
    getSessionList: jest.fn(),
    createEvent: jest.fn(),
    createSession: jest.fn(),
    updateSession: jest.fn(),
    deleteSession: jest.fn(),
    deleteSessionGroup: jest.fn(),
    updateEvent: jest.fn(),
    deleteEvent: jest.fn(),
  },
}));
jest.mock('@/stores', () => ({ useClubId: () => 'club-1' }));

const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
jest.mock('@/stores/useToastStore', () => ({
  toastSuccess: (...args: unknown[]) => mockToastSuccess(...args),
  toastError: (...args: unknown[]) => mockToastError(...args),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

function createAxiosError(code?: number): AxiosError {
  const error = new AxiosError('Request failed');
  error.response = {
    data: code !== undefined ? { code } : {},
    status: 400,
    statusText: 'Bad Request',
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  };
  return error;
}

describe('isSessionForceRequiredError', () => {
  it('AxiosError가 아니면 false를 반환한다', () => {
    expect(isSessionForceRequiredError(new Error('generic'))).toBe(false);
    expect(isSessionForceRequiredError(null)).toBe(false);
    expect(isSessionForceRequiredError('string error')).toBe(false);
  });

  it('force 필요 코드(20305)이면 true를 반환한다', () => {
    expect(isSessionForceRequiredError(createAxiosError(20305))).toBe(true);
  });

  it('force 필요 코드(20306)이면 true를 반환한다', () => {
    expect(isSessionForceRequiredError(createAxiosError(20306))).toBe(true);
  });

  it('다른 에러 코드이면 false를 반환한다', () => {
    expect(isSessionForceRequiredError(createAxiosError(20800))).toBe(false);
  });

  it('코드가 없는 AxiosError이면 false를 반환한다', () => {
    expect(isSessionForceRequiredError(createAxiosError())).toBe(false);
  });
});

describe('useAdminMonthlySessionList', () => {
  it('세션 목록을 조회한다', async () => {
    const mockData = { thisWeek: [], sessions: [] };
    (adminScheduleApi.getSessionList as jest.Mock).mockResolvedValue({
      data: { data: mockData },
    });

    const { result } = renderHook(() => useAdminMonthlySessionList(2026, 6), {
      wrapper: createWrapper(createQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
    expect(adminScheduleApi.getSessionList).toHaveBeenCalledWith('club-1', undefined);
  });

  it('기수 필터를 전달한다', async () => {
    (adminScheduleApi.getSessionList as jest.Mock).mockResolvedValue({
      data: { data: { thisWeek: [], sessions: [] } },
    });

    const { result } = renderHook(() => useAdminMonthlySessionList(2026, 2, 7), {
      wrapper: createWrapper(createQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(adminScheduleApi.getSessionList).toHaveBeenCalledWith('club-1', 7);
  });
});

describe('useCreateSchedule', () => {
  it('성공 시 쿼리를 무효화한다', async () => {
    (adminScheduleApi.createEvent as jest.Mock).mockResolvedValue({
      data: { data: 'ok' },
    });
    const qc = createQueryClient();
    const invalidateSpy = jest.spyOn(qc, 'invalidateQueries');

    const { result } = renderHook(() => useCreateSchedule(), {
      wrapper: createWrapper(qc),
    });

    await act(async () => {
      result.current.mutate({
        title: '테스트',
        content: '',
        location: '',
        cardinal: 7,
        start: '2026-06-01T10:00:00',
        end: '2026-06-01T12:00:00',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalled();
  });

  it('에러 시 토스트를 표시한다', async () => {
    (adminScheduleApi.createEvent as jest.Mock).mockRejectedValue(createAxiosError(20800));

    const { result } = renderHook(() => useCreateSchedule(), {
      wrapper: createWrapper(createQueryClient()),
    });

    await act(async () => {
      result.current.mutate({
        title: '테스트',
        content: '',
        location: '',
        cardinal: 7,
        start: '2026-06-01T10:00:00',
        end: '2026-06-01T12:00:00',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockToastError).toHaveBeenCalledWith('존재하지 않는 일정입니다.');
  });
});

describe('useCreateSession', () => {
  it('성공 시 토스트와 콜백을 호출한다', async () => {
    (adminScheduleApi.createSession as jest.Mock).mockResolvedValue({
      data: { data: null },
    });
    const onSuccess = jest.fn();

    const { result } = renderHook(() => useCreateSession({ onSuccess }), {
      wrapper: createWrapper(createQueryClient()),
    });

    await act(async () => {
      result.current.mutate({
        title: '세션',
        content: '',
        location: '',
        cardinal: 7,
        start: '2026-06-01T10:00:00',
        end: '2026-06-01T12:00:00',
        recurrenceType: null,
        recurrenceEndDate: null,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockToastSuccess).toHaveBeenCalledWith('세션이 생성되었습니다');
    expect(onSuccess).toHaveBeenCalled();
  });
});

describe('useUpdateSession', () => {
  it('성공 시 토스트와 콜백을 호출한다', async () => {
    (adminScheduleApi.updateSession as jest.Mock).mockResolvedValue({
      data: { data: null },
    });
    const onSuccess = jest.fn();

    const { result } = renderHook(() => useUpdateSession({ onSuccess }), {
      wrapper: createWrapper(createQueryClient()),
    });

    await act(async () => {
      result.current.mutate({
        sessionId: 1,
        body: { title: '수정', content: '', location: '', start: '', end: '' },
        scope: 'THIS_ONLY',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockToastSuccess).toHaveBeenCalledWith('세션이 수정되었습니다');
    expect(onSuccess).toHaveBeenCalled();
  });

  it('force 필요 에러 시 토스트 없이 콜백만 호출한다', async () => {
    (adminScheduleApi.updateSession as jest.Mock).mockRejectedValue(createAxiosError(20305));
    const onError = jest.fn();

    const { result } = renderHook(() => useUpdateSession({ onError }), {
      wrapper: createWrapper(createQueryClient()),
    });

    await act(async () => {
      result.current.mutate({
        sessionId: 1,
        body: { title: '수정', content: '', location: '', start: '', end: '' },
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockToastError).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
  });
});

describe('useDeleteSession', () => {
  it('성공 시 토스트와 콜백을 호출한다', async () => {
    (adminScheduleApi.deleteSession as jest.Mock).mockResolvedValue({
      data: { data: null },
    });
    const onSuccess = jest.fn();

    const { result } = renderHook(() => useDeleteSession({ onSuccess }), {
      wrapper: createWrapper(createQueryClient()),
    });

    await act(async () => {
      result.current.mutate({ sessionId: 1, scope: 'THIS_ONLY' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockToastSuccess).toHaveBeenCalledWith('세션이 삭제되었습니다');
    expect(onSuccess).toHaveBeenCalled();
  });

  it('force 필요 에러(20306) 시 토스트 없이 콜백만 호출한다', async () => {
    (adminScheduleApi.deleteSession as jest.Mock).mockRejectedValue(createAxiosError(20306));
    const onError = jest.fn();

    const { result } = renderHook(() => useDeleteSession({ onError }), {
      wrapper: createWrapper(createQueryClient()),
    });

    await act(async () => {
      result.current.mutate({ sessionId: 1 });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockToastError).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
  });
});

describe('useDeleteSessionGroup', () => {
  it('성공 시 토스트와 콜백을 호출한다', async () => {
    (adminScheduleApi.deleteSessionGroup as jest.Mock).mockResolvedValue({
      data: { data: null },
    });
    const onSuccess = jest.fn();

    const { result } = renderHook(() => useDeleteSessionGroup({ onSuccess }), {
      wrapper: createWrapper(createQueryClient()),
    });

    await act(async () => {
      result.current.mutate({ groupId: 10 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockToastSuccess).toHaveBeenCalledWith('세션 그룹이 삭제되었습니다');
    expect(onSuccess).toHaveBeenCalled();
  });
});

describe('useUpdateSchedule', () => {
  it('성공 시 쿼리를 무효화한다', async () => {
    (adminScheduleApi.updateEvent as jest.Mock).mockResolvedValue({
      data: { data: null },
    });
    const qc = createQueryClient();
    const invalidateSpy = jest.spyOn(qc, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateSchedule(), {
      wrapper: createWrapper(qc),
    });

    await act(async () => {
      result.current.mutate({
        eventId: 1,
        body: { title: '수정', content: '', location: '', start: '', end: '' },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalled();
  });
});

describe('useDeleteSchedule', () => {
  it('성공 시 콜백과 쿼리 무효화를 수행한다', async () => {
    (adminScheduleApi.deleteEvent as jest.Mock).mockResolvedValue({
      data: { data: null },
    });
    const onSuccess = jest.fn();
    const qc = createQueryClient();
    const invalidateSpy = jest.spyOn(qc, 'invalidateQueries');

    const { result } = renderHook(() => useDeleteSchedule({ onSuccess }), {
      wrapper: createWrapper(qc),
    });

    await act(async () => {
      result.current.mutate(1);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(onSuccess).toHaveBeenCalled();
    expect(invalidateSpy).toHaveBeenCalled();
  });

  it('에러 시 토스트를 표시한다', async () => {
    (adminScheduleApi.deleteEvent as jest.Mock).mockRejectedValue(createAxiosError(20800));

    const { result } = renderHook(() => useDeleteSchedule(), {
      wrapper: createWrapper(createQueryClient()),
    });

    await act(async () => {
      result.current.mutate(1);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockToastError).toHaveBeenCalledWith('존재하지 않는 일정입니다.');
  });
});
