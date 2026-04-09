'use client';

import * as React from 'react';
import { Avatar as AvatarPrimitive } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const avatarVariants = cva('group/avatar relative flex shrink-0 overflow-hidden select-none', {
  variants: {
    type: {
      round: 'rounded-full',
      square: 'rounded-md',
    },
    size: {
      128: 'size-32',
      64: 'size-16',
      24: 'size-6',
    },
  },
  defaultVariants: {
    type: 'round',
    size: 64,
  },
});

interface AvatarProps
  extends React.ComponentProps<typeof AvatarPrimitive.Root>, VariantProps<typeof avatarVariants> {}

function Avatar({ className, type, size, ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-type={type ?? 'round'}
      data-size={size ?? 64}
      className={cn(avatarVariants({ type, size }), className)}
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('aspect-square size-full', className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'bg-container-neutral text-text-alternative flex size-full items-center justify-center',
        'group-data-[type=round]/avatar:rounded-full',
        'group-data-[type=square]/avatar:rounded-md',
        'group-data-[size="24"]/avatar:text-xs',
        'group-data-[size="64"]/avatar:text-sm',
        'group-data-[size="128"]/avatar:text-base',
        className,
      )}
      {...props}
    />
  );
}

function AvatarBadge({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        'bg-primary text-primary-foreground ring-background absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full ring-2 select-none',
        'group-data-[size="24"]/avatar:size-2 group-data-[size="24"]/avatar:[&>svg]:hidden',
        'group-data-[size="64"]/avatar:size-2.5 group-data-[size="64"]/avatar:[&>svg]:size-2',
        'group-data-[size="128"]/avatar:size-3 group-data-[size="128"]/avatar:[&>svg]:size-2',
        className,
      )}
      {...props}
    />
  );
}

function AvatarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        'group/avatar-group *:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2',
        className,
      )}
      {...props}
    />
  );
}

function AvatarGroupCount({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        'ring-background bg-container-neutral text-text-alternative relative flex shrink-0 items-center justify-center rounded-full ring-2',
        'group-has-data-[size="24"]/avatar-group:size-6 group-has-data-[size="24"]/avatar-group:text-xs',
        'group-has-data-[size="64"]/avatar-group:size-16 group-has-data-[size="64"]/avatar-group:text-sm',
        'group-has-data-[size="128"]/avatar-group:size-32 group-has-data-[size="128"]/avatar-group:text-base',
        className,
      )}
      {...props}
    />
  );
}

export {
  Avatar,
  avatarVariants,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
  type AvatarProps,
};
