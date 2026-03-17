import Image from 'next/image';

import { cn } from '@/lib/cn';
import { LoginCoverIcon } from '@/assets/icons';
import { SocialLoginButtons } from '@/components/auth';

function LoginCard({ className }: { className?: string }) {
  return (
    <div className={cn('shadow-dialog flex overflow-hidden rounded-lg', className)}>
      {/* 좌측: 커버 */}
      <div className="bg-container-neutral-alternative flex h-[427px] flex-1 flex-col items-center justify-center gap-[10px] p-600">
        <Image src={LoginCoverIcon} alt="Weeth 서비스 소개" width={259} height={151} />
        <p className="typo-sub2 text-text-alternative text-center">
          우리 동아리를 더 알차게 즐기는
          <br />
          커뮤니티 플랫폼 Weeth
        </p>
      </div>
      {/* 우측: 소셜 로그인 */}
      <div className="bg-container-neutral flex h-[427px] flex-1 flex-col items-center justify-center p-600">
        <SocialLoginButtons className="w-full" />
      </div>
    </div>
  );
}

export { LoginCard };
