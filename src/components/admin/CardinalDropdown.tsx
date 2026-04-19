import { ArrowDownIcon } from '@/assets/icons';
import {
  Card,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
} from '@/components/ui';
import type { Cardinal } from '@/types/admin/cardinal';

interface CardinalDropdownProps {
  cardinals: Cardinal[];
  activeCardinal?: Cardinal;
  onSelect: (id: number) => void;
}

function CardinalDropdown({ cardinals, activeCardinal, onSelect }: CardinalDropdownProps) {
  return (
    <Card className="w-fit">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="border-line flex cursor-pointer items-center gap-700 rounded-sm border py-300 pr-300 pl-400"
          >
            <span className="typo-sub2 text-text-normal w-12 text-left">
              {activeCardinal ? `${activeCardinal.cardinalNumber}기` : '기수'}
            </span>
            <Icon src={ArrowDownIcon} size={24} className="text-icon-normal" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {cardinals.map((c) => (
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
