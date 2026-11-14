'use client';

import { useState } from 'react';
import { WaxGame } from '@/components/minigame/wax/WaxGame';

/**
 * 서비스 안 이벤트 페이지. GNB 아래 영역에 게임 진입 화면을 띄우고, 입장하면 게임이 화면 전체를 덮는다.
 * 나가기를 누르면 게임을 새로 그려 같은 자리의 진입 화면으로 돌아온다(접속·소리는 언마운트 때 정리된다).
 */
function WaxEventGame() {
  const [round, setRound] = useState(0);

  return (
    <div className="relative min-h-0 flex-1">
      {/* 레이아웃 폭(1440px)보다 넓은 화면에서도 진입 화면 배경이 양옆까지 이어지게 그림자로 칠한다. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[#1f2524] shadow-[0_0_0_100vmax_#1f2524] [clip-path:inset(0_-100vmax)]"
      />
      <WaxGame key={round} embedded onLeave={() => setRound((current) => current + 1)} />
    </div>
  );
}

export { WaxEventGame };
