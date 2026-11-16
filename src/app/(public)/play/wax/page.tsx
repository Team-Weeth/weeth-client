import type { Metadata } from 'next';
import { WaxGame } from '@/components/minigame/wax/WaxGame';
import { WaxPaused } from '@/components/minigame/wax/WaxPaused';
import { isWaxEnabled } from '@/flags/wax/server';

export const metadata: Metadata = {
  title: '교수님 몰래 왁뿌볼',
  description: '복도를 걸어 강의실에 들어가 교수님 몰래 왁뿌볼을 깨보세요. by Weeth',
};

// 운영 스위치를 요청마다 읽어야 배포 없이 바로 닫힌다.
export const dynamic = 'force-dynamic';

export default async function WaxPage() {
  // 꺼져 있으면 게임 컴포넌트를 아예 내려보내지 않아 WebSocket 연결도 생기지 않는다.
  if (!(await isWaxEnabled())) return <WaxPaused />;
  return <WaxGame />;
}
