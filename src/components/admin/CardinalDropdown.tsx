import ArrowDownIcon from '@/assets/icons/arrow_down.svg';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { Icon } from '@/components/ui/Icon';
import type { Cardinal } from '@/types/admin/cardinal';

const CARDINAL_DROPDOWN_MAX_HEIGHT_CLASS = 'max-h-[270px]';

interface CardinalDropdownProps {
  cardinals: Cardinal[];
  activeCardinal?: Cardinal;
  onSelect: (id: number) => void;
  onSelectAll?: () => void;
}

function CardinalDropdown({
  cardinals,
  activeCardinal,
  onSelect,
  onSelectAll,
}: CardinalDropdownProps) {
  const sortedCardinals = [...cardinals].sort((a, b) => b.cardinalNumber - a.cardinalNumber);
  const optionCount = sortedCardinals.length + (onSelectAll ? 1 : 0);

  return (
    <Card className="w-fit">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="border-line flex cursor-pointer items-center gap-700 rounded-sm border py-300 pr-300 pl-400"
          >
            <span className="typo-button1 text-text-normal w-12 text-left">
              {activeCardinal ? `${activeCardinal.cardinalNumber}기` : '전체'}
            </span>
            <Icon src={ArrowDownIcon} size={24} className="text-icon-normal" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className={optionCount > 5 ? CARDINAL_DROPDOWN_MAX_HEIGHT_CLASS : undefined}
        >
          {onSelectAll && <DropdownMenuItem onSelect={() => onSelectAll()}>전체</DropdownMenuItem>}
          {sortedCardinals.map((c) => (
            <DropdownMenuItem key={c.id} onSelect={() => onSelect(c.id)}>
              {c.cardinalNumber}기
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  );
}

export { CardinalDropdown, type CardinalDropdownProps };
