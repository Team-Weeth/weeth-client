import Image from 'next/image';

import { AvatarIcon } from '@/assets/icons';
import { HubActionCard } from '@/components/auth/hub';

export default function HubPage() {
  return (
    <div className="flex flex-col items-center gap-600 py-[80px]">
      <Image src={AvatarIcon} alt="프로필" width={80} height={80} />
      <div className="typo-h3 text-text-strong text-center">
        OOO님,반가워요!
        <br />
        어떤 동아리 활동을 시작할까요?
      </div>
      <div className="flex w-full max-w-[520px] flex-col gap-300 px-400">
        <HubActionCard variant="create" href="/hub/create" />
        <HubActionCard variant="join" href="/hub/join" />
        <HubActionCard variant="go" />
      </div>
    </div>
  );
}
