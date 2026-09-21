import { act, renderHook } from '@testing-library/react';
import { useMemberPositionEditor } from '../hooks/useMemberPositionEditor';
import type { MemberPositionOption } from '@/types/admin/memberPosition';

function renderEditor(initialOptions: MemberPositionOption[], onSave = jest.fn()) {
  return renderHook(() => useMemberPositionEditor({ initialOptions, onSave }));
}

it('다른 옵션이 쥔 색상은 이름이 비어 있어도 가져올 수 없다', () => {
  const { result } = renderEditor([
    { id: '1', name: '개발', color: 'primary' },
    { id: '2', name: '', color: 'secondary' },
  ]);
  act(() => result.current.updateOption('1', { color: 'secondary' }));
  expect(result.current.options.map((option) => option.color)).toEqual(['primary', 'secondary']);
  act(() => result.current.updateOption('1', { color: 'caution' }));
  expect(result.current.options.map((option) => option.color)).toEqual(['caution', 'secondary']);
});

it('이름 여부와 무관하게 다른 옵션의 색상을 모두 사용 중으로 본다', () => {
  const { result } = renderEditor([
    { id: '1', name: '개발', color: 'primary' },
    { id: '2', name: '', color: 'secondary' },
    { id: '3', name: '   ', color: 'purple' },
  ]);
  expect(result.current.getUsedColors('1')).toEqual(['secondary', 'purple']);
  act(() => result.current.removeOption('3'));
  expect(result.current.getUsedColors('1')).toEqual(['secondary']);
});

it('공백 이름을 채워 저장하면 다듬은 값을 전달한다', async () => {
  const onSave = jest.fn();
  const { result } = renderEditor(
    [
      { id: '1', name: '개발', color: 'primary' },
      { id: '2', name: '   ', color: 'secondary' },
    ],
    onSave,
  );
  act(() => result.current.updateOption('2', { name: ' 기획 ' }));
  await act(async () => {
    await result.current.handleSave();
  });
  expect(onSave).toHaveBeenCalledWith([
    { id: '1', name: '개발', color: 'primary' },
    { id: '2', name: '기획', color: 'secondary' },
  ]);
});
