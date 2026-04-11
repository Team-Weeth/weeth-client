'use client';

import { Icon, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui';
import { NavToggleIcon } from '@/assets/icons';
import { cn } from '@/lib/cn';

interface LNBHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

function LNBHeader({ collapsed, onToggle }: LNBHeaderProps) {
  return (
    <div className={cn('flex h-12 items-center', collapsed ? 'justify-center' : 'gap-100 px-300')}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="flex shrink-0 cursor-pointer items-center justify-center"
            onClick={onToggle}
          >
            <Icon src={NavToggleIcon} size={36} className="text-icon-alternative" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {collapsed ? '사이드바 열기' : '사이드바 닫기'}
        </TooltipContent>
      </Tooltip>
      {!collapsed && <span className="typo-sub2 text-icon-alternative">Weeth admin</span>}
    </div>
  );
}

export { LNBHeader, type LNBHeaderProps };
