import type { ReactNode } from 'react';
import type { StaticImageData } from 'next/image';

import tutorialImg1 from '@/assets/image/home_tutorial_1.png';
import tutorialImg2 from '@/assets/image/home_tutorial_2.png';
import tutorialImg3 from '@/assets/image/home_tutorial_3.png';
import tutorialImg4 from '@/assets/image/home_tutorial_4.png';
import type { Role } from '@/types/user';

interface HomeTutorialSlide {
  overline?: string;
  title: ReactNode;
  description: string;
  image: StaticImageData;
  secondaryLabel: string;
  secondaryHref?: (clubId: string) => string;
  secondaryAction?: 'open-profile-setup-modal';
}

type HomeTutorialVariant = 'lead' | 'member';

const HOME_TUTORIAL_SEEN_KEY_PREFIX = 'home-tutorial-seen';
const HOME_TUTORIAL_PENDING_KEY_PREFIX = 'home-tutorial-pending';

const LEAD_HOME_TUTORIAL_SLIDES: HomeTutorialSlide[] = [
  {
    overline: '사이트 완성하기',
    title: (
      <>
        동아리의 프로필과 배경화면을 설정해서
        <br />
        사이트를 꾸며보세요!
      </>
    ),
    description: '운영진 서비스에서 언제든 수정할 수 있어요.',
    image: tutorialImg1,
    secondaryLabel: '설정하러 가기',
    secondaryHref: (clubId) => `/${clubId}/admin/club-info`,
  },
  {
    overline: '사이트 완성하기',
    title: (
      <>
        운영진 페이지에서
        <br />
        정기모임 일정을 추가해보세요
      </>
    ),
    description: '운영진 서비스에서 언제든 추가할 수 있어요.',
    image: tutorialImg2,
    secondaryLabel: '설정하러 가기',
    secondaryHref: (clubId) => `/${clubId}/admin/schedule?tab=session`,
  },
  {
    overline: '사이트 완성하기',
    title: '초대 링크를 복사하고 멤버를 초대해요.',
    description: '별도의 승인 없이 바로 접근할 수 있어요.',
    image: tutorialImg3,
    secondaryLabel: '초대하러 가기',
  },
  {
    overline: '사이트 완성하기',
    title: (
      <>
        동아리별로 프로필을 설정하고,
        <br />
        하나의 프로필을 여러 동아리에서 함께 사용할 수도 있어요.
      </>
    ),
    description: '같은 프로필을 사용하는 동아리에는 변경 사항이 함께 반영돼요.',
    image: tutorialImg4,
    secondaryLabel: '프로필 설정하러 가기',
    secondaryAction: 'open-profile-setup-modal',
  },
];

const MEMBER_HOME_TUTORIAL_SLIDES: HomeTutorialSlide[] = [
  {
    overline: '가입하기',
    title: (
      <>
        동아리별로 프로필을 설정하고,
        <br />
        하나의 프로필을 여러 동아리에서 함께 사용할 수도 있어요.
      </>
    ),
    description: '같은 프로필을 사용하는 동아리에는 변경 사항이 함께 반영돼요.',
    image: tutorialImg4,
    secondaryLabel: '프로필 설정하러 가기',
    secondaryAction: 'open-profile-setup-modal',
  },
];

const HOME_TUTORIAL_SLIDES: Record<HomeTutorialVariant, HomeTutorialSlide[]> = {
  lead: LEAD_HOME_TUTORIAL_SLIDES,
  member: MEMBER_HOME_TUTORIAL_SLIDES,
};

function getHomeTutorialVariantByRole(role: Role | undefined): HomeTutorialVariant | null {
  if (!role) return null;
  if (role === 'LEAD') return 'lead';
  if (role === 'USER') return 'member';
  return null;
}

function getHomeTutorialSeenKey(clubId: string, variant: HomeTutorialVariant) {
  return `${HOME_TUTORIAL_SEEN_KEY_PREFIX}:${clubId}:${variant}`;
}

function getHomeTutorialPendingKey(variant: HomeTutorialVariant) {
  return `${HOME_TUTORIAL_PENDING_KEY_PREFIX}:${variant}`;
}

export {
  HOME_TUTORIAL_SLIDES,
  getHomeTutorialPendingKey,
  getHomeTutorialSeenKey,
  getHomeTutorialVariantByRole,
};
export type { HomeTutorialSlide, HomeTutorialVariant };
