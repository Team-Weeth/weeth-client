'use client';

import Image from 'next/image';
import { cn } from '@/lib/cn';
import { Button, type ButtonProps } from '@/components/ui';
import { KakaoLogoIcon } from '@/assets/icons';

type KakaoLoginButtonProps = Omit<ButtonProps, 'variant' | 'size'>;

function KakaoLoginButton({ className, onClick, ...props }: KakaoLoginButtonProps) {
  function handleKakaoLogin() {
    const clientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;
    const params = new URLSearchParams({ response_type: 'code' });
    if (clientId) params.set('client_id', clientId);
    if (redirectUri) params.set('redirect_uri', `${window.location.origin}${redirectUri}`);

    window.location.href = `https://kauth.kakao.com/oauth/authorize?${params}`;
  }

  return (
    <Button
      variant="kakao"
      size="social"
      className={cn('w-full', className)}
      onClick={onClick ?? handleKakaoLogin}
      {...props}
    >
      <Image
        src={KakaoLogoIcon}
        alt="kakao-login"
        width={18}
        height={18}
        className="absolute left-[14px]"
      />
      카카오로 시작하기
    </Button>
  );
}

export { KakaoLoginButton, type KakaoLoginButtonProps };
