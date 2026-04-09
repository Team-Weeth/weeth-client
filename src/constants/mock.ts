import type { ClubDto } from '@/types/mypage';
import mockBanner from '@/assets/image/mock-banner.png';

export const MOCK_USER = {
  name: '김위드',
  bio: '잘부탁드립니다.',
  profileImageUrl: mockBanner.src,
  email: 'weeth12@gmail.com',
  phone: '01012345678',
  introduction: '방가방가햄토리',
  image: '카카오 기본',
  loginInfo: '카카오 로그인',
  university: '가천대학교',
  department: '경영학과',
  studentId: '202612123',
};

export const MOCK_CLUBS: ClubDto[] = [
  {
    id: '1A2b3C',
    name: 'Leets',
    schoolName: '가천대학교',
    description: '함께 배우고 성장하는 개발자 커뮤니티',
    profileImageUrl: mockBanner.src,
    memberCount: 368,
    cardinals: [31, 32],
    memberRole: 'USER',
    memberStatus: 'ACTIVE',
  },
  {
    id: '4D5e6F',
    name: '가천대 검도부',
    schoolName: '가천대학교',
    description: '날씨가 춥네요, 건강이 최고',
    profileImageUrl: mockBanner.src,
    memberCount: 42,
    cardinals: [],
    memberRole: 'ADMIN',
    memberStatus: 'ACTIVE',
  },
];

/** 기수 선택 모달(Step 2)에서 표시할 가천대 검도부의 선택 가능 기수 목록 */
export const MOCK_AVAILABLE_CARDINALS = [8, 7, 6, 5, 3, 2, 1];

export const MOCK_UNIVERSITIES = ['가천대학교', '고려대학교', '연세대학교', '서울대학교'];
export const MOCK_DEPARTMENTS = [
  '컴퓨터공학과',
  '소프트웨어학과',
  '정보통신공학과',
  '전자공학과',
  '컴퓨터공학과',
  '소프트웨어학과',
  '정보통신공학과',
  '전자공학과',
  '컴퓨터공학과',
  '소프트웨어학과',
  '정보통신공학과',
  '전자공학과',
  '컴퓨터공학과',
  '소프트웨어학과',
  '정보통신공학과',
  '전자공학과',
  '컴퓨터공학과',
  '소프트웨어학과',
  '정보통신공학과',
  '전자공학과',
  '컴퓨터공학과',
  '소프트웨어학과',
  '정보통신공학과',
  '전자공학과',
];
