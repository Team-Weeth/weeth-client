'use client';

import { cn } from '@/lib/cn';
import { ChannelList } from '@/components/board/ChannelList';
import type { BoardNavItem } from '@/components/board/ChannelList';

interface BoardNavProps extends React.ComponentProps<'nav'> {
  items: BoardNavItem[];
  activeId: string;
  onItemSelect?: (id: string) => void;
}

function BoardNav({ className, items, activeId, onItemSelect, ...props }: BoardNavProps) {
  return (
    <nav
      className={cn(
        'bg-container-neutral flex w-[304px] flex-col items-start rounded-lg',
        className,
      )}
      aria-label="게시판"
      {...props}
    >
      {/* 헤더 */}
      <h2 className="typo-sub1 text-text-strong self-stretch px-450 pt-450 pb-300">게시판</h2>

      {/* 채널 목록 */}
      <ChannelList
        className="items-start self-stretch px-450 py-400"
        items={items}
        activeId={activeId}
        onItemSelect={onItemSelect}
      />
    </nav>
  );
}

export { BoardNav, type BoardNavProps, type BoardNavItem };
