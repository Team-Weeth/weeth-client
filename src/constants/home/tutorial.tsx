import type { ReactNode } from 'react';
import type { StaticImageData } from 'next/image';

import tutorialImg1 from '@/assets/image/home_tutorial_1.png';
import tutorialImg2 from '@/assets/image/home_tutorial_2.png';
import tutorialImg3 from '@/assets/image/home_tutorial_3.png';

interface HomeTutorialSlide {
  title: ReactNode;
  description: string;
  image: StaticImageData;
  secondaryLabel: string;
  secondaryHref?: (clubId: string) => string;
}

export const HOME_TUTORIAL_SLIDES: HomeTutorialSlide[] = [
  {
    title: (
      <>
        동아리의 프로필과 배경화면을 설정해서
        <br />
        사이트를 꾸며보세요!
      </>
    ),
    description: '관리자 서비스에서 언제든 수정할 수 있어요.',
    image: tutorialImg1,
    secondaryLabel: '설정하러 가기',
    secondaryHref: (clubId) => `/${clubId}/admin/club-info`,
  },
  {
    title: (
      <>
        관리자 페이지에서
        <br />
        정기모임 일정을 추가해보세요
      </>
    ),
    description: '관리자 서비스에서 언제든 추가할 수 있어요.',
    image: tutorialImg2,
    secondaryLabel: '설정하러 가기',
    secondaryHref: (clubId) => `/${clubId}/admin/schedule?tab=session`,
  },
  {
    title: '초대 링크를 복사하고 멤버를 초대해요.',
    description: '별도의 승인 없이 바로 접근할 수 있어요.',
    image: tutorialImg3,
    secondaryLabel: '초대하러 가기',
  },
];

export type { HomeTutorialSlide };
