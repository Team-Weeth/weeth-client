'use client';

import type { MouseEvent } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tag } from '@/components/ui/tag';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface MemberHiddenCardinalsBadgeProps {
  cardinals: number[];
  onTriggerClick?: (event: MouseEvent) => void;
}

function MemberHiddenCardinalsBadge({
  cardinals,
  onTriggerClick,
}: MemberHiddenCardinalsBadgeProps) {
  const isMobile = useMediaQuery('(max-width: 695.98px)');
  const label = cardinals.map((cardinal) => `${cardinal}기`).join(', ');
  const badge = (
    <Tag variant="end" className="rounded-[5px]">
      +{cardinals.length}
    </Tag>
  );

  if (isMobile) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <span
            role="button"
            tabIndex={0}
            className="cursor-pointer"
            aria-label={`숨겨진 기수 ${label}`}
            onClick={onTriggerClick}
          >
            {badge}
          </span>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="center"
          sideOffset={8}
          className="bg-container-floating text-text-on-floating typo-sub1 w-fit rounded-sm px-[14px] py-[10px] shadow-md"
        >
          {label}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          role="button"
          tabIndex={0}
          className="cursor-default"
          aria-label={`숨겨진 기수 ${label}`}
          onClick={onTriggerClick}
        >
          {badge}
        </span>
      </TooltipTrigger>
      <TooltipContent variant="dark" side="top" align="center" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export { MemberHiddenCardinalsBadge, type MemberHiddenCardinalsBadgeProps };
