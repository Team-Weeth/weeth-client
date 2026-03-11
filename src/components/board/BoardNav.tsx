'use client';

import Image from 'next/image';
import type { StaticImageData } from 'next/image';
import { cn } from '@/lib/cn';
import { Divider } from '@/components/ui';
import {
  MegaphoneDarkActiveIcon,
  MegaphoneDarkIcon,
  MegaphoneWhiteActiveIcon,
  MegaphoneWhiteIcon,
  PinIcon,
} from '@/assets/icons';
import { useThemeStore } from '@/stores/theme-store';

interface BoardNavItem {
  id: string;
  label: string;
  type: 'notice' | 'channel';
}

interface BoardNavProps extends React.ComponentProps<'nav'> {
  items: BoardNavItem[];
  activeId: string;
  onItemSelect?: (id: string) => void;
}

function BoardNav({ className, items, activeId, onItemSelect, ...props }: BoardNavProps) {
  const isDark = useThemeStore((state) => state.isDark);
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
      <ul className="flex flex-col items-start gap-200 self-stretch px-450 py-400" role="list">
        {items.map((item, index) => {
          const isActive = item.id === activeId;
          const prevItem = items[index - 1];
          const showDivider = prevItem && prevItem.type === 'notice' && item.type === 'channel';

          return (
            <li key={item.id} className="flex flex-col gap-200 self-stretch">
              {showDivider && <Divider className="my-100" />}
              <button
                type="button"
                className={cn(
                  'focus-visible:outline-ring flex w-full cursor-pointer items-center gap-300 self-stretch rounded-md p-200 focus-visible:outline-2 focus-visible:outline-offset-2',
                  isActive
                    ? 'bg-container-primary text-text-inverse'
                    : 'text-text-normal hover:bg-container-neutral-interaction',
                )}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onItemSelect?.(item.id)}
              >
                {item.type === 'notice' ? (
                  <Image
                    src={
                      (isDark
                        ? isActive
                          ? MegaphoneDarkActiveIcon
                          : MegaphoneWhiteIcon
                        : isActive
                          ? MegaphoneWhiteActiveIcon
                          : MegaphoneDarkIcon) as StaticImageData
                    }
                    alt=""
                    width={24}
                    height={24}
                    aria-hidden
                  />
                ) : (
                  <span
                    aria-hidden
                    className={cn(
                      'block h-6 w-6 shrink-0 mask-contain mask-center mask-no-repeat',
                      isActive ? 'bg-text-inverse' : 'bg-icon-strong',
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
    </nav>
  );
}

export { BoardNav, type BoardNavProps, type BoardNavItem };
