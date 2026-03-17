import Image from 'next/image';

import { cn } from '@/lib/cn';
import { LoginCoverIcon } from '@/assets/icons';
import { SocialLoginButtons } from '@/components/auth';

function LoginCard({ className }: { className?: string }) {
  return (
    <div className={cn('flex overflow-hidden rounded-lg shadow-dialog', className)}>
      {/* 좌측: 커버 */}
      <div className="flex flex-col items-center justify-center gap-400 bg-[var(--neutral-800)] px-[72px] py-[64px]">
        <Image src={LoginCoverIcon} alt="Weeth 서비스 소개" width={259} height={151} />
        <p className="typo-caption2 text-center text-text-alternative">
          우리 동아리를 더 알차게 즐기는
          <br />
          커뮤니티 플랫폼 Weeth
        </p>
      </div>
      {/* 우측: 소셜 로그인 */}
      <div className="flex flex-col items-center justify-center bg-container-neutral px-[48px] py-[64px]">
        <SocialLoginButtons className="w-[240px]" />
      </div>
    </div>
  );
}

export { LoginCard };
