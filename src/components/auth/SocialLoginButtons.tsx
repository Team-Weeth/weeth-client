import { cn } from '@/lib/cn';
import { KakaoLoginButton } from '@/components/auth/KakaoLoginButton';
import { AppleLoginButton } from '@/components/auth/AppleLoginButton';

interface SocialLoginButtonsProps extends React.HTMLAttributes<HTMLDivElement> {
  onKakaoLogin?: () => void;
  onAppleLogin?: () => void;
}

function SocialLoginButtons({ className, onKakaoLogin, onAppleLogin, ...props }: SocialLoginButtonsProps) {
  return (
    <div className={cn('flex flex-col gap-300', className)} {...props}>
      <KakaoLoginButton onClick={onKakaoLogin} />
      <AppleLoginButton onClick={onAppleLogin} />
    </div>
  );
}

export { SocialLoginButtons, type SocialLoginButtonsProps };
