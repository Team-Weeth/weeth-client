'use client';

import { AdminMeatballIcon } from '@/assets/icons/admin';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
} from '@/components/ui';
import { cn } from '@/lib/cn';

interface GenerationDropdownProps {
  generations: number[];
  selectedLabel: string;
  onSelectGeneration: (gen: number) => void;
  onSelectDirect: () => void;
}

function GenerationDropdown({
  generations,
  selectedLabel,
  onSelectGeneration,
  onSelectDirect,
}: GenerationDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'bg-button-neutral flex h-12 w-36 cursor-pointer items-center justify-between rounded-sm px-400',
          'text-text-strong typo-body2',
        )}
      >
        <span className="typo-button2 truncate">{selectedLabel}</span>
        <Icon src={AdminMeatballIcon} alt="옵션" size={24} />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem
          className={cn(selectedLabel === '직접 입력' && 'text-brand-primary')}
          onClick={onSelectDirect}
        >
          직접 입력
        </DropdownMenuItem>
        {generations.map((gen) => (
          <DropdownMenuItem
            key={gen}
            className={cn(selectedLabel === `${gen}기` && 'text-brand-primary')}
            onClick={() => onSelectGeneration(gen)}
          >
            {gen}기
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { GenerationDropdown, type GenerationDropdownProps };
