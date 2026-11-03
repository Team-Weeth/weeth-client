import type { Metadata } from 'next';
import { MyPagePenaltiesContent } from '@/components/mypage/MyPagePenaltiesContent';

export const metadata: Metadata = { title: '패널티 내역' };

// 동아리 기능 플래그는 (main) 레이아웃의 ClubFeatureProvider가 제공한다.
export default function MyPagePenaltiesPage() {
  return <MyPagePenaltiesContent />;
}
