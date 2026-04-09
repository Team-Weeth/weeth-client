'use client';

import Image from 'next/image';
import { cn } from '@/lib/cn';
import { Button, type ButtonProps } from '@/components/ui';
import { AppleLogoIcon } from '@/assets/icons';

type AppleLoginButtonProps = Omit<ButtonProps, 'variant' | 'size'>;

function AppleLoginButton({ className, ...props }: AppleLoginButtonProps) {
  return (
    <Button variant="apple" size="social" className={cn('w-full', className)} {...props}>
      <Image
        src={AppleLogoIcon}
        alt="apple-login"
        width={18}
        height={18}
        className="absolute left-[14px]"
      />
      Apple로 시작하기
    </Button>
  );
}

export { AppleLoginButton, type AppleLoginButtonProps };
