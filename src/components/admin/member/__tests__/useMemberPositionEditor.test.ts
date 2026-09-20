import { act, renderHook } from '@testing-library/react';
import { POSITION_COLORS } from '@/constants/admin/memberPosition';
import { useMemberPositionEditor } from '../hooks/useMemberPositionEditor';

it('6개 옵션에서도 선택한 색상과 겹치는 빈 옵션만 남는 색상으로 변경한다', () => {
  const { result } = renderHook(() =>
    useMemberPositionEditor({
      initialOptions: POSITION_COLORS.map(({ value }, index) => ({
        id: String(index),
        name: index === 2 ? '개발' : '',
        color: value,
      })),
      onSave: jest.fn(),
    }),
  );
  act(() => result.current.updateOption('0', { color: 'secondary' }));
  expect(result.current.options.map((option) => option.color)).toEqual([
    'secondary',
    'primary',
    'purple',
    'pink',
    'caution',
    'error',
  ]);
  act(() => result.current.updateOption('0', { color: 'purple' }));
  expect(result.current.options[0].color).toBe('secondary');
  expect(result.current.options[2]).toEqual({ id: '2', name: '개발', color: 'purple' });
});

it('공백 이름은 빈 옵션으로 취급하고 재배정 결과를 저장한다', async () => {
  const onSave = jest.fn();
  const { result } = renderHook(() =>
    useMemberPositionEditor({
      initialOptions: [
        { id: '1', name: '개발', color: 'primary' },
        { id: '2', name: '   ', color: 'secondary' },
      ],
      onSave,
    }),
  );
  act(() => result.current.updateOption('1', { color: 'secondary' }));
  expect(result.current.options[1].color).toBe('primary');
  act(() => result.current.updateOption('2', { name: '기획' }));
  await act(async () => {
    await result.current.handleSave();
  });
  expect(onSave).toHaveBeenCalledWith([
    { id: '1', name: '개발', color: 'secondary' },
    { id: '2', name: '기획', color: 'primary' },
  ]);
});
