'use client';

import { MoreVerticalIcon } from '@/assets/icons';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import type { ButtonProps } from '@/components/ui';

interface ActionMenuProps {
  className?: string;
  onEdit?: () => void;
  onDeleteSelect?: (event: Event) => void;
  triggerVariant?: ButtonProps['variant'];
  triggerSize?: ButtonProps['size'];
  triggerClassName?: string;
}

/**
 * 수정/삭제 드롭다운 메뉴
 */
function ActionMenu({
  className,
  onEdit,
  onDeleteSelect,
  triggerVariant = 'tertiary',
  triggerSize = 'icon-md',
  triggerClassName,
}: ActionMenuProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant={triggerVariant}
          size={triggerSize}
          className={cn('h-600 w-600', triggerClassName, className)}
          aria-label="더보기"
          onClickCapture={(e) => e.stopPropagation()}
        >
          <Icon src={MoreVerticalIcon} size={16} className="text-icon-normal" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[144px]">
        <DropdownMenuItem onSelect={onEdit}>수정</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={onDeleteSelect}>
          삭제
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { ActionMenu, type ActionMenuProps };
