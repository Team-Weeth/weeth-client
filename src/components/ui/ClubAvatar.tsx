'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/cn';

const clubAvatarVariants = cva('border-line border bg-container-neutral-alternative', {
  variants: {
    size: {
      128: '',
      40: '',
      50: 'size-[50px] rounded-[15px]',
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
  const avatarSize = size === 56 ? 64 : size === 50 ? 40 : (size ?? 40);

  return (
    <Avatar
      type="square"
      size={avatarSize}
      className={cn(clubAvatarVariants({ size }), className)}
      {...props}
    >
      {src && <AvatarImage src={src} alt={name} />}
      <AvatarFallback variant="club" />
    </Avatar>
  );
}

export { ClubAvatar, clubAvatarVariants, type ClubAvatarProps };
