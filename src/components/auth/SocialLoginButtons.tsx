import { cn } from '@/lib/cn';
import { KakaoLoginButton } from '@/components/auth/KakaoLoginButton';
import { AppleLoginButton } from '@/components/auth/AppleLoginButton';

interface SocialLoginButtonsProps extends React.HTMLAttributes<HTMLDivElement> {
  onKakaoLogin?: () => void;
  onAppleLogin?: () => void;
  appleClassName?: string;
  appleIconClassName?: string;
}

function SocialLoginButtons({
  className,
  onKakaoLogin,
  onAppleLogin,
  appleClassName,
  appleIconClassName,
  ...props
}: SocialLoginButtonsProps) {
  return (
    <div className={cn('flex flex-col gap-300', className)} {...props}>
      <KakaoLoginButton onClick={onKakaoLogin} />
      <AppleLoginButton
        className={appleClassName}
        iconClassName={appleIconClassName}
        onClick={onAppleLogin}
      />
    </div>
  );
}

export { SocialLoginButtons, type SocialLoginButtonsProps };
