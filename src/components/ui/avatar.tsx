'use client';

import * as React from 'react';
import { Avatar as AvatarPrimitive } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const avatarVariants = cva(
  'group/avatar relative flex shrink-0 overflow-hidden select-none object-cover',
  {
    variants: {
      type: {
        round: 'rounded-full',
        square: '',
      },
      size: {
        128: 'size-32',
        64: 'size-16',
        40: 'size-10',
        24: 'size-6',
      },
      colorScheme: {
        default: '',
        primary: '',
        secondary: '',
      },
    },
    compoundVariants: [
      { type: 'square', size: 128, className: 'rounded-[32px]' },
      { type: 'square', size: 64, className: 'rounded-lg' },
      { type: 'square', size: 40, className: 'rounded-md' },
      { type: 'square', size: 24, className: 'rounded-[6px]' },
    ],
    defaultVariants: {
      type: 'round',
      size: 64,
      colorScheme: 'default',
    },
  },
);

interface AvatarProps
  extends React.ComponentProps<typeof AvatarPrimitive.Root>, VariantProps<typeof avatarVariants> {}

function Avatar({ className, type, size, colorScheme, ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-type={type ?? 'round'}
      data-size={size ?? 64}
      data-color={colorScheme ?? 'default'}
      className={cn(avatarVariants({ type, size, colorScheme }), className)}
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

function DefaultAvatarIcon() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="64" height="64" rx="32" fill="var(--button-neutral)" />
      <circle cx="32" cy="32" r="32" fill="var(--button-neutral)" />
      <mask
        id="default-avatar-mask"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="64"
        height="64"
      >
        <circle cx="32" cy="32" r="32" fill="var(--button-neutral)" />
      </mask>
      <g mask="url(#default-avatar-mask)">
        <path
          d="M32 40C39.1825 40 45 34.1825 45 27C45 19.8175 39.1825 14 32 14C24.8175 14 19 19.8175 19 27C19 34.1825 24.8175 40 32 40ZM32 46.5C23.3225 46.5 6 50.855 6 59.5V66H58V59.5C58 50.855 40.6775 46.5 32 46.5Z"
          fill="var(--button-neutral-interaction)"
        />
      </g>
    </svg>
  );
}

function DefaultClubAvatarIcon() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 51.2C0 33.2783 0 24.3175 3.48779 17.4723C6.55574 11.4511 11.4511 6.55574 17.4723 3.48779C24.3175 0 33.2783 0 51.2 0H76.8C94.7217 0 103.683 0 110.528 3.48779C116.549 6.55574 121.444 11.4511 124.512 17.4723C128 24.3175 128 33.2783 128 51.2V76.8C128 94.7217 128 103.683 124.512 110.528C121.444 116.549 116.549 121.444 110.528 124.512C103.683 128 94.7217 128 76.8 128H51.2C33.2783 128 24.3175 128 17.4723 124.512C11.4511 121.444 6.55574 116.549 3.48779 110.528C0 103.683 0 94.7217 0 76.8V51.2Z"
        fill="var(--button-neutral)"
      />
      <rect x="70" y="47" width="26" height="26" rx="2" fill="var(--button-neutral-interaction)" />
      <circle cx="47.5" cy="48.5" r="15.5" fill="var(--button-neutral-interaction)" />
      <path
        d="M56.1427 66.7838C56.7459 65.7387 58.2541 65.7387 58.8573 66.7838L73.7877 92.6487C74.3909 93.6937 73.6369 95 72.4304 95H42.5696C41.3631 95 40.6091 93.6937 41.2123 92.6486L56.1427 66.7838Z"
        fill="var(--button-neutral-interaction)"
      />
    </svg>
  );
}

function AvatarFallback({
  className,
  variant,
  children,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback> & { variant?: 'person' | 'club' }) {
  const defaultIcon = variant === 'club' ? <DefaultClubAvatarIcon /> : <DefaultAvatarIcon />;

  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'flex size-full items-center justify-center',
        children &&
          'group-data-[color=default]/avatar:bg-container-neutral group-data-[color=default]/avatar:text-text-alternative',
        children &&
          'group-data-[color=primary]/avatar:bg-container-primary group-data-[color=primary]/avatar:text-text-inverse',
        children &&
          'group-data-[color=secondary]/avatar:bg-container-secondary group-data-[color=secondary]/avatar:text-text-inverse',
        'group-data-[type=round]/avatar:rounded-full',
        'group-data-[type=square]/avatar:rounded-md',
        'group-data-[size="24"]/avatar:text-xs',
        'group-data-[size="40"]/avatar:text-sm',
        'group-data-[size="64"]/avatar:text-sm',
        'group-data-[size="128"]/avatar:text-base',
        className,
      )}
      {...props}
    >
      {children ?? defaultIcon}
    </AvatarPrimitive.Fallback>
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
