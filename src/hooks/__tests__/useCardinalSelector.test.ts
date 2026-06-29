import { renderHook, act } from '@testing-library/react';

import { useCardinalSelector } from '@/hooks/useCardinalSelector';
import { useCardinals } from '@/hooks/queries';
import type { Cardinal } from '@/types/admin/cardinal';

jest.mock('@/hooks/queries', () => ({
  useCardinals: jest.fn(),
}));

const mockUseCardinals = useCardinals as jest.Mock;

const CARDINALS: Cardinal[] = [
  { id: 1, cardinalNumber: 3, status: 'COMPLETED', createdAt: '', modifiedAt: '' },
  { id: 2, cardinalNumber: 5, status: 'IN_PROGRESS', createdAt: '', modifiedAt: '' },
  { id: 3, cardinalNumber: 4, status: 'COMPLETED', createdAt: '', modifiedAt: '' },
];

describe('useCardinalSelector', () => {
  beforeEach(() => {
    mockUseCardinals.mockReturnValue({ data: CARDINALS });
  });

  it('기본값으로 selectedCardinalId가 null이고 activeCardinal이 undefined이다', () => {
    const { result } = renderHook(() => useCardinalSelector());

    expect(result.current.selectedCardinalId).toBeNull();
    expect(result.current.activeCardinal).toBeUndefined();
  });

  it('cardinals 목록을 반환한다', () => {
    const { result } = renderHook(() => useCardinalSelector());

    expect(result.current.cardinals).toEqual(CARDINALS);
  });

  it('latestCardinal은 cardinalNumber가 가장 높은 기수이다', () => {
    const { result } = renderHook(() => useCardinalSelector());

    expect(result.current.latestCardinal?.id).toBe(2);
    expect(result.current.latestCardinal?.cardinalNumber).toBe(5);
  });

  it('autoSelectLatest=true이면 최신 기수를 자동으로 선택한다', () => {
    const { result } = renderHook(() => useCardinalSelector({ autoSelectLatest: true }));

    expect(result.current.selectedCardinalId).toBe(2);
    expect(result.current.activeCardinal?.cardinalNumber).toBe(5);
  });

  it('setSelectedCardinalId로 선택을 변경한다', () => {
    const { result } = renderHook(() => useCardinalSelector());

    act(() => {
      result.current.setSelectedCardinalId(1);
    });

    expect(result.current.selectedCardinalId).toBe(1);
    expect(result.current.activeCardinal?.cardinalNumber).toBe(3);
  });

  it('autoSelectLatest=true여도 setSelectedCardinalId로 선택을 덮어쓸 수 있다', () => {
    const { result } = renderHook(() => useCardinalSelector({ autoSelectLatest: true }));

    act(() => {
      result.current.setSelectedCardinalId(1);
    });

    expect(result.current.selectedCardinalId).toBe(1);
    expect(result.current.activeCardinal?.cardinalNumber).toBe(3);
  });

  it('cardinals가 비어 있으면 latestCardinal이 undefined이고 selectedCardinalId가 null이다', () => {
    mockUseCardinals.mockReturnValue({ data: [] });
    const { result } = renderHook(() => useCardinalSelector({ autoSelectLatest: true }));

    expect(result.current.latestCardinal).toBeUndefined();
    expect(result.current.selectedCardinalId).toBeNull();
  });
});
