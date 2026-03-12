'use client';

import type { StaticImageData } from 'next/image';
import { MoreVerticalIcon } from '@/assets/icons';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
          <span
            aria-hidden
            className="bg-icon-normal block h-[10px] w-[3px] mask-contain mask-center mask-no-repeat"
            style={{
              maskImage: `url(${(MoreVerticalIcon as StaticImageData).src})`,
              WebkitMaskImage: `url(${(MoreVerticalIcon as StaticImageData).src})`,
            }}
          />
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
