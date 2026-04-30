import Image from 'next/image';

import { cn } from '@/lib/cn';
import { LoginCoverIcon } from '@/assets/icons';
import { Loading } from '@/components/ui';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';

interface LoginCardProps {
  className?: string;
  isLoading?: boolean;
  onKakaoLogin?: () => void;
  onAppleLogin?: () => void;
}

function LoginCard({ className, isLoading = false, onKakaoLogin, onAppleLogin }: LoginCardProps) {
  const loginContent = isLoading ? (
    <div className="flex flex-col items-center gap-400">
      <Loading />
      <p className="typo-body2 text-text-alternative">진행 중 입니다...</p>
    </div>
  ) : (
    <SocialLoginButtons
      className="w-full"
      onKakaoLogin={onKakaoLogin}
      onAppleLogin={onAppleLogin}
    />
  );

  const mobileLoginContent = isLoading ? (
    <div className="flex flex-col items-center gap-400">
      <Loading colorHex="#FFFFFF" />
      <p className="typo-body2 text-white">진행 중 입니다...</p>
    </div>
  ) : (
    <SocialLoginButtons
      className="w-full"
      appleClassName="bg-container-neutral text-text-strong hover:bg-container-neutral-interaction active:bg-container-neutral-interaction"
      appleIconClassName="invert-0 dark:invert-0"
      onKakaoLogin={onKakaoLogin}
      onAppleLogin={onAppleLogin}
    />
  );

  return (
    <div
      className={cn(
        'tablet:flex-row tablet:px-0 tablet:py-0 flex w-full max-w-[725px] flex-col overflow-hidden rounded-lg bg-[#171819] px-400 py-700 shadow-lg',
        className,
      )}
    >
      {/* 좌측: 커버 */}
      <div className="tablet:h-[427px] tablet:flex-1 tablet:p-600 flex flex-col items-center justify-center gap-[26px] bg-[#171819] px-0 py-0">
        <Image src={LoginCoverIcon} alt="Weeth 서비스 소개" width={259} height={151} />
        <p className="typo-sub3 text-text-alternative text-center">
          우리 동아리를 더 알차게 즐기는
          <br />
          커뮤니티 플랫폼 Weeth
        </p>
      </div>

      {/* 모바일: 소개 하단에  로그인 */}
      <div className="tablet:hidden mt-500 flex w-full flex-col gap-400">{mobileLoginContent}</div>

      {/* 데스크톱: 우측 소셜 로그인 / 로딩 */}
      <div className="bg-container-neutral tablet:flex hidden h-[427px] flex-1 flex-col items-center justify-center p-600">
        {loginContent}
      </div>
    </div>
  );
}

export { LoginCard };
