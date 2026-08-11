import Image from 'next/image';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import type { ButtonProps } from '@/components/ui/Button';
import KakaoLogoIcon from '@/assets/icons/kakao_logo.svg';

type KakaoLoginButtonProps = Omit<ButtonProps, 'variant' | 'size'>;

function KakaoLoginButton({ className, onClick, ...props }: KakaoLoginButtonProps) {
  return (
    <Button
      variant="kakao"
      size="social"
      className={cn('w-full gap-200', className)}
      onClick={onClick}
      {...props}
    >
      <Image src={KakaoLogoIcon} alt="kakao-icon" width={18} height={18} />
      카카오로 로그인
    </Button>
  );
}

export { KakaoLoginButton, type KakaoLoginButtonProps };
