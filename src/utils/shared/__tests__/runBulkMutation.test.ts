import { toastError, toastSuccess } from '@/stores/useToastStore';
import { runBulkMutation } from '../runBulkMutation';

jest.mock('@/stores/useToastStore', () => ({ toastError: jest.fn(), toastSuccess: jest.fn() }));

const messages = { success: '추방되었습니다.', error: '추방에 실패했습니다.' };
const serverError = (message: unknown) => ({
  isAxiosError: true,
  response: { data: { code: 21107, message, data: null } },
});

it('서버의 메시지를 기존 에러 문구보다 우선 표시한다', async () => {
  const message = '리더는 권한 이양 후 추방할 수 있습니다.';
  const result = await runBulkMutation(
    [1],
    async () => {
      throw serverError(message);
    },
    messages,
    () => '기존 문구',
  );
  expect(result).toBe(false);
  expect(toastError).toHaveBeenCalledWith(message);
  expect(toastSuccess).not.toHaveBeenCalled();
});

it.each([undefined, null, '', '   ', 123])(
  '서버 메시지가 유효하지 않으면 기본 문구를 표시한다: %s',
  async (message) => {
    await runBulkMutation(
      [1],
      async () => {
        throw serverError(message);
      },
      messages,
    );
    expect(toastError).toHaveBeenCalledWith(messages.error);
  },
);

it('여러 요청 중 서버 메시지가 있는 실패를 찾아 한 번만 표시한다', async () => {
  await runBulkMutation(
    [1, 2, 3],
    async (id) => {
      if (id === 1) throw new Error('Network Error');
      if (id === 2) throw serverError('서버에서 제공한 실패 사유');
    },
    messages,
  );
  expect(toastError).toHaveBeenCalledTimes(1);
  expect(toastError).toHaveBeenCalledWith('서버에서 제공한 실패 사유');
  expect(toastSuccess).not.toHaveBeenCalled();
});

it('전체 성공이면 성공 메시지를 표시한다', async () => {
  await expect(runBulkMutation([1, 2], async () => undefined, messages)).resolves.toBe(true);
  expect(toastSuccess).toHaveBeenCalledWith(messages.success);
  expect(toastError).not.toHaveBeenCalled();
});
