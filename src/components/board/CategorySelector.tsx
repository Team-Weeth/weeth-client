'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import ArrowDownIcon from '@/assets/icons/arrow_down.svg';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  Icon,
} from '@/components/ui';
import { ChannelList } from '@/components/board/ChannelList';
import type { BoardNavItem } from '@/types/board';

interface CategorySelectorProps {
  className?: string;
  items: BoardNavItem[];
  activeId: number | null;
  onItemSelect?: (id: number | null) => void;
  /** false로 설정하면 드롭다운 목록에서 ALL 타입 항목을 필터링하지 않음 (기본값: true) */
  filterAll?: boolean;
}

/**
 * 글쓰기 페이지의 카테고리(채널) 선택 드롭다운
 * 현재 선택된 채널을 Breadcrumb으로 표시하고, 클릭 시 ChannelList 드롭다운을 노출
 */
function CategorySelector({
  className,
  items,
  activeId,
  onItemSelect,
  filterAll = true,
}: CategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const activeItem = items.find((item) => item.id === activeId);
  const channelName = activeItem?.label ?? '';

  // 아이템 선택 후 드롭다운 닫기
  const handleItemSelect = (id: number | null) => {
    onItemSelect?.(id);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className={cn(
          'bg-container-neutral flex h-[40px] w-full items-center rounded-lg py-200 pr-200 pl-300',
          className,
        )}
      >
        <Breadcrumb className="flex-1">
          <BreadcrumbList className="flex-nowrap gap-100" showHome={false}>
            <BreadcrumbItem className="typo-button1 text-text-strong">{channelName}</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Icon src={ArrowDownIcon} size={20} className="text-icon-normal" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="flex w-[var(--radix-dropdown-menu-trigger-width)] flex-col items-start gap-200 self-stretch rounded-lg px-450 py-400 shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]"
      >
        <ChannelList
          className="w-full"
          items={filterAll ? items.filter((item) => item.type !== 'ALL') : items}
          activeId={activeId}
          onItemSelect={handleItemSelect}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { CategorySelector, type CategorySelectorProps };
