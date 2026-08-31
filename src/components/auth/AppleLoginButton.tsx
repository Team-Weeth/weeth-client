'use client';

import Image from 'next/image';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import type { ButtonProps } from '@/components/ui/Button';
import AppleLogoIcon from '@/assets/icons/apple_logo.svg';

type AppleLoginButtonProps = Omit<ButtonProps, 'variant' | 'size'>;

interface AppleLoginButtonCustomProps extends AppleLoginButtonProps {
  iconClassName?: string;
}

function AppleLoginButton({ className, iconClassName, ...props }: AppleLoginButtonCustomProps) {
  return (
    <Button variant="apple" size="social" className={cn('w-full gap-[5px]', className)} {...props}>
      <Image
        src={AppleLogoIcon}
        alt="apple-login"
        width={14}
        height={14}
        className={cn('invert dark:invert-0', iconClassName)}
      />
      Apple로 로그인
    </Button>
  );
}

export { AppleLoginButton, type AppleLoginButtonCustomProps as AppleLoginButtonProps };
