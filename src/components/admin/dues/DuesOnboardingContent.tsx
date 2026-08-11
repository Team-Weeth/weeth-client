'use client';

import Image from 'next/image';

import DuesTutorialImage from '@/assets/image/dues_tutorial.png';
import InfoCircleIcon from '@/assets/icons/info_circle.svg';
import { Button } from '@/components/ui';
import { Icon } from '@/components/ui/Icon';

interface DuesOnboardingContentProps {
  onStart?: () => void;
}

// 회비 온보딩 안내 카드의 내부 콘텐츠. 튜토리얼 모달과 인라인 오버레이가 공유한다.
function DuesOnboardingContent({ onStart }: DuesOnboardingContentProps) {
  return (
    <>
      <div className="flex flex-col gap-300 p-400">
        <Icon src={InfoCircleIcon} size={20} className="text-icon-alternative" alt="안내" />
        <div className="flex flex-col gap-200">
          <p className="typo-sub1 text-text-strong">해당 기수의 총 회비 정보를 입력해주세요</p>
          <p className="typo-body2 text-text-alternative">
            총 회비 정보를 입력하고 회비 기록을 이어나가세요. 회비 정보는 비공개로 시작돼요.
          </p>
        </div>
      </div>

      <div className="px-600 pb-400">
        <Image
          src={DuesTutorialImage}
          alt="회비 관리 미리보기"
          className="w-full rounded-md"
          placeholder="blur"
        />
      </div>

      <div className="px-400 pb-400">
        <Button variant="primary" size="lg" className="w-full" onClick={onStart}>
          총 회비 정보 입력 시작하기
        </Button>
      </div>
    </>
  );
}

export { DuesOnboardingContent, type DuesOnboardingContentProps };
