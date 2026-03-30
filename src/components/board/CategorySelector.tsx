'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { ArrowDownIcon } from '@/assets/icons';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbSeparator,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  Icon,
} from '@/components/ui';
import { ChannelList } from '@/components/board/ChannelList';
import type { BoardNavItem } from '@/components/board/ChannelList';

interface CategorySelectorProps {
  className?: string;
  items: BoardNavItem[];
  activeId: number | null;
  onItemSelect?: (id: number | null) => void;
}

/**
 * 글쓰기 페이지의 카테고리(채널) 선택 드롭다운
 * 현재 선택된 채널을 Breadcrumb으로 표시하고, 클릭 시 ChannelList 드롭다운을 노출
 */
function CategorySelector({ className, items, activeId, onItemSelect }: CategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const activeItem = items.find((item) => item.id === activeId);

  // TODO: 실제 게시판 이름은 API 연동 시 props로 전달
  const boardName = '가천대 검도부';
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
          'bg-container-neutral flex items-center gap-100 self-stretch rounded-lg py-200 pr-200 pl-300',
          className,
        )}
      >
        <Breadcrumb className="flex-1">
          <BreadcrumbList className="flex-nowrap gap-100">
            <BreadcrumbItem className="typo-button2 text-text-strong">{boardName}</BreadcrumbItem>
            <BreadcrumbSeparator className="[&>svg]:size-4" />
            <BreadcrumbItem className="typo-button2 text-text-strong">{channelName}</BreadcrumbItem>
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
          items={items}
          activeId={activeId}
          onItemSelect={handleItemSelect}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { CategorySelector, type CategorySelectorProps };
