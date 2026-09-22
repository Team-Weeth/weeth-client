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

it('옵션을 모두 지우고 저장하면 빈 목록을 전달한다', async () => {
  const onSave = jest.fn();
  const { result } = renderEditor(
    [
      { id: '1', name: '개발', color: 'primary' },
      { id: '2', name: '기획', color: 'secondary' },
    ],
    onSave,
  );
  act(() => result.current.removeOption('1'));
  act(() => result.current.removeOption('2'));
  expect(result.current.canSave).toBe(true);

  await act(async () => {
    await result.current.handleSave();
  });

  // 서버에서 빠뜨리는 것만으로는 지워지지 않아 삭제할 id를 따로 보낸다.
  expect(onSave).toHaveBeenCalledWith({ options: [], deletedIds: [1, 2] });
});

it('새로 추가한 옵션은 id 없이, 기존 옵션은 서버 id로 보낸다', async () => {
  const onSave = jest.fn();
  const { result } = renderEditor([{ id: '7', name: '개발', color: 'primary' }], onSave);
  act(() => result.current.addOption());
  act(() => result.current.updateOption(result.current.options[1].id, { name: '기획' }));

  await act(async () => {
    await result.current.handleSave();
  });

  expect(onSave).toHaveBeenCalledWith({
    options: [
      { id: 7, name: '개발', color: 'primary' },
      { id: null, name: '기획', color: 'secondary' },
    ],
    deletedIds: [],
  });
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
  expect(onSave).toHaveBeenCalledWith({
    options: [
      { id: 1, name: '개발', color: 'primary' },
      { id: 2, name: '기획', color: 'secondary' },
    ],
    deletedIds: [],
  });
});
