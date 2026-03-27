import { AlertBannerCharIcon } from '@/assets/icons';
import Image from 'next/image';

export function AlertBanner() {
  return (
    <div className="bg-container-primary-alternative mt-300 flex gap-[10px] rounded-md p-300">
      <Image src={AlertBannerCharIcon} width={40} height={40} alt="alert_banner_char" />
      <div className="flex flex-col gap-100">
        <p className="typo-sub2 text-text-normal">나의 프로필을 완성하세요!</p>
        <p className="typo-body2 text-text-alternative">완성하고 게시글을 작성해요.</p>
      </div>
    </div>
  );
}
