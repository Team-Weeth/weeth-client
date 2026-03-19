'use client';

import type { StaticImageData } from 'next/image';
import { cn } from '@/lib/cn';
import { Divider } from '@/components/ui';
import { PinIcon } from '@/assets/icons';
import { MegaphoneIcon } from '@/components/board/MegaphoneIcon';

interface BoardNavItem {
  id: string;
  label: string;
  type: 'notice' | 'channel';
}

interface ChannelListProps extends React.ComponentProps<'ul'> {
  items: BoardNavItem[];
  activeId: string;
  onItemSelect?: (id: string) => void;
}

/**
 * BoardNav와 CategorySelector에서 공유하는 채널 목록 컴포넌트
 * notice/channel 타입에 따라 아이콘을 분기하고, 타입 경계에 Divider를 렌더링
 */
function ChannelList({ className, items, activeId, onItemSelect, ...props }: ChannelListProps) {
  return (
    <ul className={cn('flex flex-col gap-200', className)} role="list" {...props}>
      {items.map((item, index) => {
        const isActive = item.id === activeId;
        const prevItem = items[index - 1];
        // notice → channel 타입 전환 시 구분선 표시
        const showDivider = prevItem && prevItem.type === 'notice' && item.type === 'channel';

        return (
          <li key={item.id} className="flex w-full flex-col gap-200">
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
              {item.type === 'notice' ? (
                <MegaphoneIcon
                  accentColor={
                    isActive
                      ? 'var(--color-text-strong)'
                      : 'var(--color-brand-primary)'
                  }
                />
              ) : (
                <span
                  aria-hidden
                  className={cn(
                    'block h-6 w-6 shrink-0 mask-contain mask-center mask-no-repeat',
                    isActive ? 'bg-text-inverse' : 'bg-icon-normal',
                  )}
                  style={{
                    maskImage: `url(${(PinIcon as StaticImageData).src})`,
                    WebkitMaskImage: `url(${(PinIcon as StaticImageData).src})`,
                  }}
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
