'use client';

import ArrowFillDownIcon from '@/assets/icons/arrow_fill_down.svg';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import type { Cardinal } from '@/types/admin/cardinal';

interface CardinalDropdownProps {
  cardinals: Cardinal[];
  activeCardinal?: Cardinal;
  onSelect: (id: number) => void;
  onSelectAll?: () => void;
  className?: string;
}

function CardinalDropdown({
  cardinals,
  activeCardinal,
  onSelect,
  onSelectAll,
  className,
}: CardinalDropdownProps) {
  const sortedCardinals = [...cardinals].sort((a, b) => b.cardinalNumber - a.cardinalNumber);
  const label = activeCardinal
    ? `${activeCardinal.cardinalNumber}기`
    : onSelectAll
      ? '전체'
      : sortedCardinals[0]
        ? `${sortedCardinals[0].cardinalNumber}기`
        : '기수';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'bg-button-neutral typo-button1 text-text-strong hover:bg-button-neutral-interaction group flex cursor-pointer items-center justify-center gap-100 rounded-md px-400 py-200',
            className,
          )}
        >
          {label}
          <Icon
            src={ArrowFillDownIcon}
            size={20}
            className="text-icon-normal transition-transform duration-200 group-data-[state=open]:rotate-180"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onSelectAll && <DropdownMenuItem onSelect={onSelectAll}>전체</DropdownMenuItem>}
        {sortedCardinals.map((cardinal) => (
          <DropdownMenuItem
            key={cardinal.id}
            onSelect={() => onSelect(cardinal.id)}
            className={cn(
              activeCardinal?.id === cardinal.id &&
                'bg-container-primary-alternative text-brand-primary focus:bg-container-primary-alternative',
            )}
          >
            {cardinal.cardinalNumber}기
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { CardinalDropdown, type CardinalDropdownProps };
