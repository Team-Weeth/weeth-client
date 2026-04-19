'use client';

import { useState } from 'react';

import { useCardinals } from '@/hooks/queries';

interface UseCardinalSelectorOptions {
  /** true이면 가장 최신 기수를 기본값으로 선택 */
  autoSelectLatest?: boolean;
}

function useCardinalSelector({ autoSelectLatest = false }: UseCardinalSelectorOptions = {}) {
  const { data: cardinals = [] } = useCardinals();
  const [selectedCardinalId, setSelectedCardinalId] = useState<number | null>(null);

  const latestCardinal =
    cardinals.length > 0
      ? cardinals.reduce((max, c) => (c.cardinalNumber > max.cardinalNumber ? c : max))
      : undefined;

  const effectiveCardinalId = autoSelectLatest
    ? (selectedCardinalId ?? latestCardinal?.id ?? null)
    : selectedCardinalId;

  const activeCardinal = effectiveCardinalId
    ? cardinals.find((c) => c.id === effectiveCardinalId)
    : undefined;

  return {
    cardinals,
    selectedCardinalId: effectiveCardinalId,
    setSelectedCardinalId,
    activeCardinal,
  };
}

export { useCardinalSelector };
