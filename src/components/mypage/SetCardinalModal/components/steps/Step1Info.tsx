import { InfoIcon } from '@/assets/icons';
import Image from 'next/image';
function Step1Info() {
  return (
    <div className="px-400 pb-400">
      <div className="bg-container-neutral-alternative flex flex-col items-center gap-400 rounded-md p-300">
        <div data-slot="alert-dialog-header" className={'flex flex-col items-center gap-400'}>
          <Image src={InfoIcon} alt="정보 아이콘" width={48} height={48} />
          <div className="typo-sub3 text-brand-primary flex flex-col items-center gap-200 text-center">
            설정 전 확인해 주세요
          </div>
        </div>
        <p className="typo-body2 text-text-normal text-center">
          활동한 기수를 정확히 선택해 주세요. 설정 후에는 수정이 불가합니다.
          <br />
          잘못 설정한 경우 동아리 운영진에게 문의해 주세요.
        </p>
      </div>
    </div>
  );
}

export { Step1Info };
