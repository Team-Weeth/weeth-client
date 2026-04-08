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
  return (
    <div
      className={cn(
        'flex w-[725px] overflow-hidden rounded-lg shadow-[0_5px_20px_0_rgba(0,0,0,0.2)]',
        className,
      )}
    >
      {/* 좌측: 커버 */}
      <div className="flex h-[427px] flex-1 flex-col items-center justify-center gap-[26px] bg-[#171819] p-600">
        <Image src={LoginCoverIcon} alt="Weeth 서비스 소개" width={259} height={151} />
        <p className="typo-sub2 text-text-alternative text-center">
          우리 동아리를 더 알차게 즐기는
          <br />
          커뮤니티 플랫폼 Weeth
        </p>
      </div>
      {/* 우측: 소셜 로그인 / 로딩 */}
      <div className="bg-container-neutral flex h-[427px] flex-1 flex-col items-center justify-center p-600">
        {isLoading ? (
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
        )}
      </div>
    </div>
  );
}

export { LoginCard };
