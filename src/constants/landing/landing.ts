import {
  LandingServiceBoardImage,
  LandingServiceMemberImage,
  AdviceImage,
  BicycleImage,
  YogaImage,
  RunningImage,
  StudyImage,
} from '@/assets/icons/landing';
import type { Feature } from '@/components/landing';

export const USER_FEATURES: Feature[] = [
  {
    chipLabel: '게시판',
    cardTitle: '게시판에서 우리 동아리의 활동을 확인하고 나의 활동을 공유해보세요',
    description: '동아리 게시판으로 활동을 공유해요.',
    bgColor: 'bg-[#00877A]',
    image: LandingServiceBoardImage,
  },
  {
    chipLabel: '출석',
    cardTitle: '정기모임을 놓치지 않고 출석하며 동아리 활동을 이어나가세요',
    description: '간편하게 출석을 확인해요.',
    bgColor: 'bg-[#00877A]',
    image: LandingServiceBoardImage,
  },
  {
    chipLabel: '모바일',
    cardTitle: '모바일에서도 동아리와 연결되어 보세요.',
    description: '언제 어디서나 동아리와 함께해요.',
    bgColor: 'bg-[#00877A]',
    image: LandingServiceBoardImage,
  },
];

export const ADMIN_FEATURES: Feature[] = [
  {
    chipLabel: '멤버 관리',
    cardTitle: '기수별로 멤버 가입을 관리해보세요',
    description: '기수별 멤버를 효율적으로 관리해요.',
    bgColor: 'bg-[#00877A]',
    image: LandingServiceMemberImage,
  },
  {
    chipLabel: '일정 관리',
    cardTitle: '정기모임 일정을 한번에 저장하고, 부원과 공유해보세요',
    description: '일정을 한눈에 관리해요.',
    bgColor: 'bg-[#00877A]',
    image: LandingServiceBoardImage,
  },
  {
    chipLabel: '출석 관리',
    cardTitle: '출석과 페널티를 일괄 처리하여 운영의 효율을 높이세요.',
    description: '출석 관리를 자동화해요.',
    bgColor: 'bg-[#00877A]',
    image: LandingServiceBoardImage,
  },
];

export const CLUB_TYPES = [
  { label: '고민상담', image: AdviceImage },
  { label: '자전거', image: BicycleImage },
  { label: '요가', image: YogaImage },
  { label: '러닝', image: RunningImage },
  { label: '스터디', image: StudyImage },
];

export const SETUP_GUIDE_STEPS = [
  {
    number: '1',
    title: '동아리 정보 입력',
    description:
      '동아리의 정보와 개설을 시작하는 리더의 정보만 작성해도 우리 동아리만의 커뮤니티 사이트를 개설할 수 있어요.',
    bg: 'bg-[#1E2021]',
  },
  {
    number: '2',
    title: '사이트 개설 완료',
    description:
      '동아리의 정보가 담긴 동아리 커뮤니티 사이트를 개설해요. 사이트의 배경화면, 프로필 등으로 동아리의 정체성을 표현해요.',
    bg: 'bg-[#00877A]',
  },
  {
    number: '3',
    title: '부원 초대하기',
    description:
      '개설하면서 생성된 사이트 링크를 부원에게 공유하며 초대해요. 초대된 부원은 가입요청 후 동아리 운영진이 가입 승인을 진행해요.',
    bg: 'bg-[#00C8AA]',
  },
];

export const FOOTER_MENUS = [
  {
    title: 'Weeth 서비스',
    items: [
      { label: '서비스 소개', href: '/landing#service' },
      { label: '관리자 서비스', href: '/landing#admin-service' },
      { label: '문의 메일', href: 'mailto:contact@weeth.kr' },
    ],
  },
];

export const NAV_ITEMS = [
  { id: 'service', label: '서비스 소개', href: '#service' },
  { id: 'contact', label: '가입 문의', href: '#contact' },
];
