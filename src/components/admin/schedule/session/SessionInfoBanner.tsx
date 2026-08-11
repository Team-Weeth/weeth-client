import InfoCircleIcon from '@/assets/icons/info_circle.svg';
import { Icon } from '@/components/ui';

function SessionInfoBanner() {
  return (
    <div className="bg-container-neutral-alternative flex items-start gap-200 rounded-md p-300">
      <Icon src={InfoCircleIcon} size={20} className="text-icon-alternative mt-[2px]" />
      <p className="typo-body2 text-text-alternative flex-1">
        세션은 출석을 진행할 동아리의 공식적인 모임입니다. <br /> 생성된 세션은 출석 관리에 자동으로
        연결되며, 출석 내역 확인 및 수정은 출석 관리 탭에서 진행해주세요.
      </p>
    </div>
  );
}

export { SessionInfoBanner };
