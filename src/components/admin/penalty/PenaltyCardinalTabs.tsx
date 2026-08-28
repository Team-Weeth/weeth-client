'use client';

import { CardinalCard } from '@/components/admin';
import { useDragScroll } from '@/hooks';
import { cn } from '@/lib/cn';

interface PenaltyCardinalTabsProps {
  cardinalNumbers: number[];
  selectedCardinal: number;
  onSelectCardinal: (cardinalNumber: number) => void;
  className?: string;
}

function PenaltyCardinalTabs({
  cardinalNumbers,
  selectedCardinal,
  onSelectCardinal,
  className,
}: PenaltyCardinalTabsProps) {
  const { ref: dragScrollRef, onMouseDown } = useDragScroll();
  const sortedCardinalNumbers = [...cardinalNumbers].sort((a, b) => b - a);

  return (
    <div
      ref={dragScrollRef}
      role="group"
      aria-label="기수 필터"
      className={cn(
        'scrollbar-none flex w-max max-w-full cursor-grab items-center gap-700 overflow-x-auto px-600 select-none active:cursor-grabbing',
        className,
      )}
      onMouseDown={onMouseDown}
    >
      {sortedCardinalNumbers.map((cardinalNumber) => (
        <CardinalCard
          key={cardinalNumber}
          aria-pressed={selectedCardinal === cardinalNumber}
          variant={selectedCardinal === cardinalNumber ? 'active' : 'normal'}
          title={`${cardinalNumber}기`}
          onClick={() => onSelectCardinal(cardinalNumber)}
        />
      ))}
    </div>
  );
}

export { PenaltyCardinalTabs, type PenaltyCardinalTabsProps };
