import type { ReactNode } from 'react';
import type { StaticImageData } from 'next/image';

import tutorialImg1 from '@/assets/images/home_tutorial_img1.png';
import tutorialImg2 from '@/assets/images/home_tutorial_img2.png';
import tutorialImg3 from '@/assets/images/home_tutorial_img3.png';

interface HomeTutorialSlide {
  title: ReactNode;
  description: string;
  image: StaticImageData;
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
  },
  {
    title: '관리자 페이지에서 정기모임 일정을 추가해보세요.',
    description: '관리자 서비스에서 언제든 추가할 수 있어요.',
    image: tutorialImg2,
  },
  {
    title: '사이트 링크로 멤버를 초대해요.',
    description: '승인은 관리자 서비스에서 할 수 있어요.',
    image: tutorialImg3,
  },
];

export type { HomeTutorialSlide };
