'use client';

import { cn } from '@/lib/cn';
import { Divider } from '@/components/ui/Divider';
import { Icon } from '@/components/ui/Icon';
import PinIcon from '@/assets/icons/pin.svg';
import { MegaphoneIcon } from '@/components/board/MegaphoneIcon';
import type { BoardNavItem } from '@/types/board';

interface ChannelListProps extends React.ComponentProps<'ul'> {
  items: BoardNavItem[];
  activeId: number | null;
  onItemSelect?: (id: number | null) => void;
}

/**
 * BoardNav와 CategorySelector에서 공유하는 채널 목록 컴포넌트
 * notice/channel 타입에 따라 아이콘을 분기하고, 타입 경계에 Divider를 렌더링
 * 정렬은 useBoardList의 select에서 처리됨 (매 렌더 정렬 방지)
 */
function ChannelList({ className, items, activeId, onItemSelect, ...props }: ChannelListProps) {
  return (
    <ul className={cn('flex flex-col gap-200', className)} role="list" {...props}>
      {items.map((item, index) => {
        const isActive = item.id === activeId;
        const prevItem = items[index - 1];
        // NOTICE/ALL → GENERAL 타입 전환 시 구분선 표시
        const showDivider = prevItem && prevItem.type !== 'GENERAL' && item.type === 'GENERAL';

        return (
          <li key={item.id ?? item.type} className="flex w-full flex-col gap-200">
            {showDivider && <Divider className="my-100" />}
            <button
              type="button"
              className={cn(
                'flex w-full cursor-pointer items-center gap-300 rounded-md p-200',
                'focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2',
                isActive
                  ? 'bg-container-primary text-text-inverse'
                  : 'text-text-normal hover:bg-container-neutral-interaction',
              )}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onItemSelect?.(item.id)}
            >
              {item.type === 'NOTICE' ? (
                <MegaphoneIcon
                  accentColor={isActive ? 'var(--color-text-strong)' : 'var(--color-brand-primary)'}
                />
              ) : (
                <Icon
                  src={PinIcon}
                  size={24}
                  className={isActive ? 'text-text-inverse' : 'text-icon-normal'}
                />
              )}
              <span className="typo-button1 truncate">{item.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export { ChannelList, type ChannelListProps, type BoardNavItem };
