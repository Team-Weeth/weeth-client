import { renderHook } from '@testing-library/react';
import { useWritableBoards } from '@/hooks/board/useWritableBoards';
import { useBoardList } from '@/hooks/board/useBoardQuery';

jest.mock('@/hooks/board/useBoardQuery', () => ({
  useBoardList: jest.fn(),
}));

const mockUseBoardList = useBoardList as jest.Mock;

const mockBoards = [
  { id: null, name: '전체', type: 'ALL' as const },
  {
    id: 2,
    name: '공지사항',
    type: 'NOTICE' as const,
    boardConfig: { canWrite: false, canComment: false },
  },
  {
    id: 3,
    name: '자유게시판',
    type: 'GENERAL' as const,
    boardConfig: { canWrite: true, canComment: true },
  },
];

describe('useWritableBoards', () => {
  it('boards가 undefined이면 items와 writableItems가 빈 배열이다', () => {
    mockUseBoardList.mockReturnValue({ data: undefined });
    const { result } = renderHook(() => useWritableBoards());

    expect(result.current.boards).toBeUndefined();
    expect(result.current.items).toEqual([]);
    expect(result.current.writableItems).toEqual([]);
  });

  it('items는 모든 게시판을 BoardNavItem으로 변환한 배열이다', () => {
    mockUseBoardList.mockReturnValue({ data: mockBoards });
    const { result } = renderHook(() => useWritableBoards());

    expect(result.current.items).toHaveLength(3);
    expect(result.current.items[0]).toMatchObject({ label: '전체', type: 'ALL' });
  });

  it('type=ALL 게시판은 writableItems에 포함되지 않는다', () => {
    mockUseBoardList.mockReturnValue({ data: mockBoards });
    const { result } = renderHook(() => useWritableBoards());

    const hasAll = result.current.writableItems.some((item) => item.type === 'ALL');
    expect(hasAll).toBe(false);
  });

  it('canWrite=false 게시판은 writableItems에 포함되지 않는다', () => {
    mockUseBoardList.mockReturnValue({ data: mockBoards });
    const { result } = renderHook(() => useWritableBoards());

    const notice = result.current.writableItems.find((item) => item.type === 'NOTICE');
    expect(notice).toBeUndefined();
  });

  it('canWrite=true이고 type이 ALL이 아닌 게시판만 writableItems에 포함된다', () => {
    mockUseBoardList.mockReturnValue({ data: mockBoards });
    const { result } = renderHook(() => useWritableBoards());

    expect(result.current.writableItems).toHaveLength(1);
    expect(result.current.writableItems[0]).toMatchObject({ type: 'GENERAL', canWrite: true });
  });

  it('boards를 그대로 반환한다', () => {
    mockUseBoardList.mockReturnValue({ data: mockBoards });
    const { result } = renderHook(() => useWritableBoards());

    expect(result.current.boards).toBe(mockBoards);
  });
});
