'use client';

import { useCardinals } from '@/hooks/queries';
import { useClubId } from '@/stores';
import {
  useSelectedCardinalNumber,
  useSelectedCardinalActions,
} from '@/stores/useSelectedCardinalStore';

interface UseCardinalSelectorOptions {
  /** true이면 가장 최신 기수를 기본값으로 선택 */
  autoSelectLatest?: boolean;
  /** 선택 상태를 공유할 범위 키. 같은 scope끼리 페이지 이동 간 선택이 유지된다. */
  scope?: string;
}

function useCardinalSelector({
  autoSelectLatest = false,
  scope = 'default',
}: UseCardinalSelectorOptions = {}) {
  const clubId = useClubId();
  const { data: cardinals = [], isPending, isFetching } = useCardinals();
  const selectedCardinalNumber = useSelectedCardinalNumber(clubId, scope);
  const { select } = useSelectedCardinalActions();

  const latestCardinal =
    cardinals.length > 0
      ? cardinals.reduce((max, c) => (c.cardinalNumber > max.cardinalNumber ? c : max))
      : undefined;

  // 스토어에 저장된 기수 번호를 현재 클럽의 기수 목록에서 되찾는다.
  // (클럽이 바뀌었거나 해당 기수가 사라졌으면 매칭되지 않아 자동으로 최신 기수로 대체된다)
  const selectedCardinal =
    selectedCardinalNumber != null
      ? cardinals.find((c) => c.cardinalNumber === selectedCardinalNumber)
      : undefined;

  const activeCardinal = selectedCardinal ?? (autoSelectLatest ? latestCardinal : undefined);

  const setSelectedCardinalId = (id: number | null) => {
    if (!clubId) return;
    if (id === null) {
      select(clubId, scope, null);
      return;
    }
    const target = cardinals.find((c) => c.id === id);
    if (target) select(clubId, scope, target.cardinalNumber);
  };

  return {
    cardinals,
    selectedCardinalId: activeCardinal?.id ?? null,
    setSelectedCardinalId,
    activeCardinal,
    latestCardinal,
    isLoading: isPending || (isFetching && cardinals.length === 0),
  };
}

export { useCardinalSelector };
