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
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui';
import { formatLastUpdated } from '@/utils/shared/date';
import type { Cardinal } from '@/types/admin/cardinal';
import type { LastModified } from '@/types/admin/dues';

interface DuesGenerationFilterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  cardinals: Cardinal[];
  activeCardinal?: Cardinal;
  isNotRegistered: boolean;
  updaterProfile?: LastModified;
  onSelect: (id: number) => void;
}

function DuesGenerationFilter({
  className,
  cardinals,
  isNotRegistered,
  activeCardinal,
  updaterProfile,
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
            className="bg-button-neutral typo-button2 text-text-strong hover:bg-button-neutral-interaction flex shrink-0 cursor-pointer items-center gap-100 rounded-sm px-300 py-200 whitespace-nowrap"
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
      {!isNotRegistered && (
        <div className="bg-container-neutral tablet:flex-none tablet:justify-start flex flex-1 items-center justify-between gap-200 rounded-md px-300 py-200">
          <span className="typo-body1 text-text-alternative">
            마지막 수정
            <br className="tablet:hidden" />
            <span className="tablet:inline hidden">&nbsp;&nbsp;</span>
            {updaterProfile?.modifiedAt ? formatLastUpdated(updaterProfile.modifiedAt) : '-'}
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Avatar size={24}>
                  <AvatarImage
                    src={updaterProfile?.modifiedBy.profileImageUrl ?? undefined}
                    alt="마지막 수정자 프로필"
                  />
                  <AvatarFallback />
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>{updaterProfile?.modifiedBy.name}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}

export { DuesGenerationFilter, type DuesGenerationFilterProps };
