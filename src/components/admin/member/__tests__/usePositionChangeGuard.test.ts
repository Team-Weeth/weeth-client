import { renderHook, act } from '@testing-library/react';
import { usePositionChangeGuard } from '../hooks/usePositionChangeGuard';
import { useAdminPositionOptions } from '@/hooks/queries/admin/useAdminPositionQueries';
import { toastError, toastWarning } from '@/stores/useToastStore';
import type { MemberPositionOption } from '@/types/admin/memberPosition';

jest.mock('@/hooks/queries/admin/useAdminPositionQueries', () => ({
  useAdminPositionOptions: jest.fn(),
}));
jest.mock('@/stores/useToastStore', () => ({
  toastError: jest.fn(),
  toastWarning: jest.fn(),
}));

function mockOptionsQuery(
  status: 'pending' | 'error' | 'success',
  options: MemberPositionOption[],
) {
  jest
    .mocked(useAdminPositionOptions)
    .mockReturnValue({ data: options, status } as ReturnType<typeof useAdminPositionOptions>);
}

beforeEach(() => {
  jest.clearAllMocks();
});

it('조회 중에는 변경을 막고 안내한다', () => {
  mockOptionsQuery('pending', []);
  const { result } = renderHook(() => usePositionChangeGuard());

  expect(result.current.ensureOptions()).toBe(false);
  expect(toastWarning).toHaveBeenCalled();
  expect(result.current.emptyDialogProps.open).toBe(false);
});

it('조회에 실패하면 변경을 막고 오류를 알린다', () => {
  mockOptionsQuery('error', []);
  const { result } = renderHook(() => usePositionChangeGuard());

  expect(result.current.ensureOptions()).toBe(false);
  expect(toastError).toHaveBeenCalled();
  expect(result.current.emptyDialogProps.open).toBe(false);
});

it('조회에 성공했는데 옵션이 없으면 안내 모달을 연다', () => {
  mockOptionsQuery('success', []);
  const { result } = renderHook(() => usePositionChangeGuard());

  act(() => {
    expect(result.current.ensureOptions()).toBe(false);
  });
  expect(result.current.emptyDialogProps.open).toBe(true);
  expect(toastWarning).not.toHaveBeenCalled();
  expect(toastError).not.toHaveBeenCalled();
});

it('옵션이 있으면 변경을 허용한다', () => {
  mockOptionsQuery('success', [{ id: '1', name: '기획', color: 'purple' }]);
  const { result } = renderHook(() => usePositionChangeGuard());

  expect(result.current.ensureOptions()).toBe(true);
  expect(result.current.emptyDialogProps.open).toBe(false);
});
