import type { ClubDto } from '@/types/mypage';
import type { MemberPosition, MemberPost, MemberProfile } from '@/types/member';
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

// ─── 납부 대상 Mock ───────────────────────────────────────────────────────────

export interface MockPaymentTargetInfo {
  userId: number;
  clubMemberId: number;
  name: string;
  tel: string;
  school: string;
  department: string;
  memberRole: 'LEAD' | 'ADMIN' | 'USER';
  memberStatus: 'ACTIVE' | 'INACTIVE';
  profileImageUrl: string | null;
}

export interface MockPaymentTarget {
  targetId: number;
  paymentTargetInfo: MockPaymentTargetInfo;
  targetStatus: 'TARGETED' | 'EXCLUDED';
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  dueAmount: number;
  paidAmount: number;
  paidAt: string | null;
  confirmedBy: number | null;
  memo: string | null;
}

const MOCK_MEMBERS: Pick<MockPaymentTargetInfo, 'name' | 'department' | 'memberRole'>[] = [
  { name: '김지수', department: '컴퓨터공학과', memberRole: 'LEAD' },
  { name: '이도윤', department: '소프트웨어학과', memberRole: 'ADMIN' },
  { name: '박서연', department: '정보통신공학과', memberRole: 'USER' },
  { name: '최민준', department: '전자공학과', memberRole: 'USER' },
  { name: '정하은', department: '경영학과', memberRole: 'USER' },
  { name: '윤지호', department: '산업공학과', memberRole: 'USER' },
  { name: '강나연', department: '컴퓨터공학과', memberRole: 'USER' },
  { name: '조현우', department: '소프트웨어학과', memberRole: 'ADMIN' },
  { name: '임서영', department: '정보통신공학과', memberRole: 'USER' },
  { name: '한지민', department: '전자공학과', memberRole: 'USER' },
  { name: '신민서', department: '경영학과', memberRole: 'USER' },
  { name: '오승현', department: '산업공학과', memberRole: 'USER' },
  { name: '문예린', department: '컴퓨터공학과', memberRole: 'USER' },
  { name: '권태양', department: '소프트웨어학과', memberRole: 'USER' },
  { name: '류하진', department: '정보통신공학과', memberRole: 'USER' },
  { name: '배수현', department: '전자공학과', memberRole: 'USER' },
  { name: '유재원', department: '경영학과', memberRole: 'USER' },
  { name: '남가은', department: '산업공학과', memberRole: 'USER' },
  { name: '고도현', department: '컴퓨터공학과', memberRole: 'USER' },
  { name: '천지우', department: '소프트웨어학과', memberRole: 'USER' },
  { name: '장미래', department: '정보통신공학과', memberRole: 'USER' },
  { name: '허성민', department: '전자공학과', memberRole: 'USER' },
  { name: '노은채', department: '경영학과', memberRole: 'USER' },
  { name: '서준혁', department: '산업공학과', memberRole: 'USER' },
  { name: '공하늘', department: '컴퓨터공학과', memberRole: 'USER' },
];

/** 납부 대상 Mock 데이터 — 25명 (TARGETED 20, EXCLUDED 5), 납부/미납/환불 상태 섞음 */
export const MOCK_PAYMENT_TARGETS: MockPaymentTarget[] = MOCK_MEMBERS.map(
  ({ name, department, memberRole }, idx) => {
    const targetStatus = idx < 20 ? 'TARGETED' : 'EXCLUDED';
    // TARGETED만 납부 상태를 섞어 뱃지를 확인할 수 있게 한다(4→PAID, 4→REFUNDED, 나머지 UNPAID).
    const paymentStatus: MockPaymentTarget['paymentStatus'] =
      targetStatus === 'EXCLUDED'
        ? 'UNPAID'
        : idx % 4 === 0
          ? 'PAID'
          : idx % 4 === 1
            ? 'REFUNDED'
            : 'UNPAID';
    const isPaid = paymentStatus === 'PAID';
    return {
      targetId: idx + 1,
      paymentTargetInfo: {
        userId: idx + 1,
        clubMemberId: idx + 1,
        name,
        tel: `0101234${String(idx).padStart(4, '0')}`,
        school: '가천대학교',
        department,
        memberRole,
        memberStatus: 'ACTIVE',
        profileImageUrl: null,
      },
      targetStatus,
      paymentStatus,
      dueAmount: 50000,
      paidAmount: isPaid ? 50000 : 0,
      paidAt: isPaid ? '2026-03-01T12:00:00' : null,
      confirmedBy: null,
      memo: null,
    };
  },
);
// ─── 이월 잔액 Mock ───────────────────────────────────────────────────────────
// null = 이전 기수 정보 없음, object = 이전 기수 잔액 존재
export const MOCK_PREVIOUS_BALANCE: { balance: number; generationNumber: number } | null = {
  balance: 240000,
  generationNumber: 3,
};

// ─── 멤버 목록 Mock ───────────────────────────────────────────────────────────

export const MOCK_MEMBER_PROFILES: MemberProfile[] = [
  {
    id: 1,
    name: '김지수',
    profileImageUrl: mockBanner.src,
    coverImageUrl: mockBanner.src,
    cardinals: [8],
    role: 'LEAD',
    position: '기획',
    description: '안녕하세요! 이번 기수 회장을 맡은 김지수입니다. 잘 부탁드려요.',
    phone: '01012340001',
    email: 'jisoo.kim@weeth.com',
    department: '경영학과',
    studentId: '202610001',
  },
  {
    id: 2,
    name: '이도윤',
    profileImageUrl: null,
    coverImageUrl: null,
    cardinals: [7, 8],
    role: 'ADMIN',
    position: '백엔드',
    description: '백엔드 개발을 맡고 있는 이도윤입니다. 편하게 말씀해주세요.',
    phone: '01012340002',
    email: 'doyoon.lee@weeth.com',
    department: '컴퓨터공학과',
    studentId: '202610002',
  },
  {
    id: 3,
    name: '박서연',
    profileImageUrl: null,
    coverImageUrl: null,
    cardinals: [8],
    role: 'USER',
    position: '프론트엔드',
    description: '프론트엔드에 관심 많은 박서연입니다. 열심히 하겠습니다!',
    phone: '01012340003',
    email: 'seoyeon.park@weeth.com',
    department: '소프트웨어학과',
    studentId: '202610003',
  },
  {
    id: 4,
    name: '최민준',
    profileImageUrl: null,
    coverImageUrl: null,
    cardinals: [6, 7, 8],
    role: 'USER',
    position: '프론트엔드',
    description: '반갑습니다, 최민준입니다. 함께 성장해요.',
    phone: '01012340004',
    email: 'minjun.choi@weeth.com',
    department: 'AI·소프트웨어학부',
    studentId: '202610004',
  },
  {
    id: 5,
    name: '정하은',
    profileImageUrl: null,
    coverImageUrl: null,
    cardinals: [8],
    role: 'USER',
    position: '디자인',
    description: '디자인을 맡고 있는 정하은입니다. 잘 부탁드립니다.',
    phone: '01012340005',
    email: 'haeun.jung@weeth.com',
    department: '시각디자인학과',
    studentId: '202610005',
  },
  {
    id: 6,
    name: '윤지호',
    profileImageUrl: null,
    coverImageUrl: null,
    cardinals: [7],
    role: 'ADMIN',
    position: '백엔드',
    description: '운영진 윤지호입니다. 궁금한 점 있으면 언제든 편하게 물어봐주세요.',
    phone: '01012340006',
    email: 'jiho.yoon@weeth.com',
    department: '컴퓨터공학과',
    studentId: '202610006',
  },
  {
    id: 7,
    name: '강나연',
    profileImageUrl: null,
    coverImageUrl: null,
    cardinals: [8],
    role: 'USER',
    position: '디자인',
    description: '안녕하세요, 강나연입니다. 잘 부탁드려요!',
    phone: '01012340007',
    email: 'nayeon.kang@weeth.com',
    department: '시각디자인학과',
    studentId: '202610007',
  },
  {
    id: 8,
    name: '조현우',
    profileImageUrl: null,
    coverImageUrl: null,
    cardinals: [5, 6, 7, 8],
    role: 'USER',
    position: '프론트엔드',
    description: '오래 활동하고 있는 조현우입니다. 반갑습니다.',
    phone: '01012340008',
    email: 'hyunwoo.jo@weeth.com',
    department: '소프트웨어학과',
    studentId: '202610008',
  },
  // 스크롤/무한목록 확인용으로 대량 생성한 목업 (아래 MOCK_MEMBERS 이름 목록 재사용)
  ...MOCK_MEMBERS.map(({ name, department, memberRole }, idx) => {
    const id = 9 + idx;
    const positions: MemberPosition[] = ['프론트엔드', '백엔드', '디자인', '기획'];
    const position = positions[idx % positions.length];
    const latestCardinal = 8 - (idx % 4);
    const cardinals = idx % 3 === 0 ? [latestCardinal, latestCardinal - 1] : [latestCardinal];
    return {
      id,
      name,
      profileImageUrl: null,
      coverImageUrl: null,
      cardinals,
      role: memberRole,
      position,
      description: `안녕하세요, ${name}입니다. 잘 부탁드려요.`,
      phone: `0101234${String(id).padStart(4, '0')}`,
      email: `member${id}@weeth.com`,
      department,
      studentId: `20261${String(id).padStart(4, '0')}`,
    };
  }),
];

export const MOCK_MEMBER_POSTS: MemberPost[] = [
  {
    postId: 1001,
    boardId: 1,
    memberId: 1,
    title: '이번주는 중간고사로 쉬어갑니다',
    content:
      '오늘은 이상하게 초반에 몸이 잘 안 풀려서 걱정했는데\n후반 스파링에서 한 번 제대로 들어간 머리 타격이 있어서 기분 좋았습니다.\n\n아직 발이 먼저 나가고 상체가 늦게 따라오는 게 문제인 것 같아요.\n영상 찍어보니까 생각보다 자세가 많이 무너지더라고요.\n\n그래도 오늘은 "도망가지 말자"는 목표는 지킨 것 같아서 만족합니다.',
    isNew: true,
    likeCount: 2,
    commentCount: 2,
    createdAt: '2026-09-01T09:00:00',
    files: [],
  },
  {
    postId: 1000,
    boardId: 1,
    memberId: 1,
    title: '이번주는 중간고사로 쉬어갑니다',
    content:
      '오늘은 이상하게 초반에 몸이 잘 안 풀려서 걱정했는데\n후반 스파링에서 한 번 제대로 들어간 머리 타격이 있어서 기분 좋았습니다.\n\n아직 발이 먼저 나가고 상체가 늦게 따라오는 게 문제인 것 같아요.\n영상 찍어보니까 생각보다 자세가 많이 무너지더라고요.\n\n그래도 오늘은 "도망가지 말자"는 목표는 지킨 것 같아서 만족합니다.',
    isNew: false,
    likeCount: 2,
    commentCount: 2,
    createdAt: '2026-08-25T09:00:00',
    files: [
      { id: 1, fileName: 'kendo-1.png', fileUrl: mockBanner.src },
      { id: 2, fileName: 'kendo-2.png', fileUrl: mockBanner.src },
      { id: 3, fileName: 'kendo-3.png', fileUrl: mockBanner.src },
      { id: 4, fileName: 'kendo-4.png', fileUrl: mockBanner.src },
    ],
  },
];

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
