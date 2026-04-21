'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/cn';

const clubAvatarVariants = cva('border-line border bg-container-neutral-alternative', {
  variants: {
    size: {
      40: '',
      56: 'size-14',
      64: '',
    },
  },
  defaultVariants: {
    size: 40,
  },
});

interface ClubAvatarProps
  extends
    Omit<React.ComponentProps<typeof Avatar>, 'type' | 'size'>,
    VariantProps<typeof clubAvatarVariants> {
  src?: string | null;
  name: string;
}

function ClubAvatar({ src, name, size, className, ...props }: ClubAvatarProps) {
  const avatarSize = size === 56 ? 64 : (size ?? 40);

  return (
    <Avatar
      type="square"
      size={avatarSize}
      className={cn(clubAvatarVariants({ size }), className)}
      {...props}
    >
      {src && <AvatarImage src={src} alt={name} />}
      <AvatarFallback>{name.charAt(0)}</AvatarFallback>
    </Avatar>
  );
}

export { ClubAvatar, clubAvatarVariants, type ClubAvatarProps };
