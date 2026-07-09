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
