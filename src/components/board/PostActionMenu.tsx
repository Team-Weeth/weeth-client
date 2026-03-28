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

interface PostActionMenuProps {
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  triggerVariant?: ButtonProps['variant'];
  triggerSize?: ButtonProps['size'];
  triggerClassName?: string;
}

function PostActionMenu({
  className,
  onEdit,
  onDelete,
  onClick,
  triggerVariant = 'tertiary',
  triggerSize = 'icon-md',
  triggerClassName,
}: PostActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant={triggerVariant}
          size={triggerSize}
          className={cn('h-600 w-600', triggerClassName, className)}
          aria-label="더보기"
          onClick={onClick}
        >
          <Icon src={MoreVerticalIcon} size={16} className="text-icon-normal" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[144px]">
        <DropdownMenuItem onSelect={onEdit}>수정</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={onDelete}>
          삭제
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { PostActionMenu, type PostActionMenuProps };
