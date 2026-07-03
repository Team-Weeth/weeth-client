'use client';

import Image from 'next/image';
import { ArrowDownIcon } from '@/assets/icons';
import { cn } from '@/lib/cn';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import type { Cardinal } from '@/types/admin/cardinal';
import { formatLastUpdated } from '@/utils/shared/date';

interface DuesGenerationFilterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  cardinals: Cardinal[];
  activeCardinal?: Cardinal;
  lastUpdated: string;
  updaterProfileImage?: string;
  onSelect: (id: number) => void;
}

function DuesGenerationFilter({
  className,
  cardinals,
  activeCardinal,
  lastUpdated,
  updaterProfileImage,
  onSelect,
  ...props
}: DuesGenerationFilterProps) {
  const displayLabel = activeCardinal
    ? `${activeCardinal.cardinalNumber}기`
    : cardinals[0]
      ? `${cardinals[0].cardinalNumber}기`
      : '기수 선택';

  return (
    <div className={cn('flex flex-row items-start gap-200', className)} {...props}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="bg-button-neutral typo-button2 text-text-strong hover:bg-button-neutral-interaction flex cursor-pointer items-center gap-100 rounded-sm px-300 py-200"
          >
            {displayLabel}
            <Image src={ArrowDownIcon} alt="아래 방향 화살표" width={16} height={16} />
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
      <div className="bg-container-neutral flex items-center gap-200 rounded-md px-300 py-200">
        <span className="typo-body1` text-text-alternative">
          마지막 수정&nbsp;&nbsp;{lastUpdated ? formatLastUpdated(lastUpdated) : '-'}
        </span>
        <Avatar size={24}>
          <AvatarImage src={updaterProfileImage} alt="마지막 수정자 프로필" />
          <AvatarFallback />
        </Avatar>
      </div>
    </div>
  );
}

export { DuesGenerationFilter, type DuesGenerationFilterProps };
