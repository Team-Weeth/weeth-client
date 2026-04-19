import Image from 'next/image';
import { cn } from '@/lib/cn';
import { Button, type ButtonProps } from '@/components/ui';
import { KakaoLogoIcon } from '@/assets/icons';

type KakaoLoginButtonProps = Omit<ButtonProps, 'variant' | 'size'>;

function KakaoLoginButton({ className, onClick, ...props }: KakaoLoginButtonProps) {
  return (
    <Button
      variant="kakao"
      size="social"
      className={cn('w-full', className)}
      onClick={onClick}
      {...props}
    >
      <Image
        src={KakaoLogoIcon}
        alt="kakao-icon"
        width={18}
        height={18}
        className="absolute left-[14px]"
      />
      카카오로 시작하기
    </Button>
  );
}

export { KakaoLoginButton, type KakaoLoginButtonProps };
