import { cn } from '@/lib/cn';
import { KakaoLoginButton } from '@/components/auth/KakaoLoginButton';
import { AppleLoginButton } from '@/components/auth/AppleLoginButton';

interface SocialLoginButtonsProps extends React.HTMLAttributes<HTMLDivElement> {
  onKakaoLogin?: () => void;
}

function SocialLoginButtons({ className, onKakaoLogin, ...props }: SocialLoginButtonsProps) {
  return (
    <div className={cn('flex flex-col gap-300', className)} {...props}>
      <KakaoLoginButton onClick={onKakaoLogin} />
      <AppleLoginButton />
    </div>
  );
}

export { SocialLoginButtons, type SocialLoginButtonsProps };
