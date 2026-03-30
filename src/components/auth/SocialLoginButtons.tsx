import { cn } from '@/lib/cn';
import { KakaoLoginButton } from '@/components/auth/KakaoLoginButton';
import { AppleLoginButton } from '@/components/auth/AppleLoginButton';

type SocialLoginButtonsProps = React.HTMLAttributes<HTMLDivElement>;

function SocialLoginButtons({ className, ...props }: SocialLoginButtonsProps) {
  return (
    <div className={cn('flex flex-col gap-300', className)} {...props}>
      <KakaoLoginButton />
      <AppleLoginButton />
    </div>
  );
}

export { SocialLoginButtons, type SocialLoginButtonsProps };
