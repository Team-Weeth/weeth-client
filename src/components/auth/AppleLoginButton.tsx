'use client';

import Image from 'next/image';
import { cn } from '@/lib/cn';
import { Button, type ButtonProps } from '@/components/ui';
import { AppleLogoIcon } from '@/assets/icons';

type AppleLoginButtonProps = Omit<ButtonProps, 'variant' | 'size'>;

function AppleLoginButton({ className, ...props }: AppleLoginButtonProps) {
  return (
    <Button variant="apple" size="social" className={cn('w-full gap-[5px]', className)} {...props}>
      <Image
        src={AppleLogoIcon}
        alt="apple-login"
        width={14}
        height={14}
        className="invert dark:invert-0"
      />
      Apple로 로그인
    </Button>
  );
}

export { AppleLoginButton, type AppleLoginButtonProps };
