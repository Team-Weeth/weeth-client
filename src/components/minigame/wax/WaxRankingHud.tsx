'use client';

import { useEffect, useState } from 'react';
import { waxRankingApi } from '@/lib/apis/waxRanking';
import { waxDeviceToken } from '@/lib/minigame/waxIdentity';
import { cn } from '@/lib/cn';
import type { WaxRanking, WaxRankingEntry } from '@/types/wax';

/** 다른 사람의 기록은 이 간격으로 새로 받는다. */
const REFRESH_MS = 30_000;
/** 내가 깬 직후에는 서버가 기록을 쓸 틈을 두고 다시 받는다. */
const AFTER_BREAK_MS = 800;
/** 인원과 상관없이 줄 수를 고정해 높이가 늘지 않게 한다(상위 3명 + 내 순위 1줄). */
const TOP = 3;

function Row({ entry, mine }: { entry: WaxRankingEntry; mine: boolean }) {
  return (
    <li
      className={cn(
        'typo-button2 text-text-normal flex items-center gap-[8px] rounded-[6px] px-[8px] py-[5px] tabular-nums',
        mine && 'bg-button-primary-subtle text-brand-primary',
      )}
    >
      <span
        className={cn(
          'w-[24px] shrink-0 text-right',
          entry.rank <= 3 ? 'text-brand-primary' : 'text-text-alternative',
        )}
      >
        {entry.rank}
      </span>
      <span className="min-w-0 flex-1 truncate">{entry.name}</span>
      <span className={cn('shrink-0', !mine && 'text-text-alternative')}>{entry.brokenWaxes}</span>
    </li>
  );
}

/**
 * 게임 중 오른쪽 위에 고정한 오늘 랭킹(slither.io·agar.io식 리더보드). 누르는 단계 없이 바로 보이고 입력을 받지 않는다.
 * 바로 위 방 버튼 묶음·교실 배지와 같은 흰 바탕(container-neutral)·10px 모서리로 맞춘다.
 */
export function WaxRankingHud({ brokenNow, className }: { brokenNow: number; className?: string }) {
  const [ranking, setRanking] = useState<WaxRanking | null>(null);

  // 처음 한 번, 이후 30초마다, 그리고 내가 왁뿌볼을 깰 때마다(서버가 깰 때마다 기록한다) 새로 받는다.
  useEffect(() => {
    let cancelled = false;
    const load = () =>
      waxRankingApi
        .get('DAILY', waxDeviceToken())
        .then((response) => !cancelled && setRanking(response.data.data))
        // 불러오지 못해도 게임에는 영향이 없다. 이전 값을 그대로 둔다.
        .catch(() => undefined);
    const first = setTimeout(() => void load(), brokenNow > 0 ? AFTER_BREAK_MS : 0);
    const timer = setInterval(() => void load(), REFRESH_MS);
    return () => {
      cancelled = true;
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [brokenNow]);

  const top = ranking?.rankings.slice(0, TOP) ?? [];
  const me = ranking?.me ?? null;
  const meInTop = me !== null && top.some((entry) => entry.rank === me.rank);

  return (
    <section
      aria-label="오늘 랭킹"
      className={cn(
        'bg-container-neutral pointer-events-none flex flex-col gap-[8px] rounded-[10px] px-[12px] py-[14px]',
        className,
      )}
    >
      <p className="typo-button2 text-text-strong px-[8px]">오늘 랭킹</p>
      {ranking && top.length === 0 ? (
        <p className="typo-caption1 text-text-alternative px-[8px] break-keep">
          첫 기록의 주인공이 되어보세요!
        </p>
      ) : (
        <ol className="flex flex-col">
          {top.map((entry) => (
            <Row key={entry.rank} entry={entry} mine={entry.rank === me?.rank} />
          ))}
        </ol>
      )}
      {me && !meInTop && (
        <ul className="border-line border-t pt-[8px]">
          <Row entry={me} mine />
        </ul>
      )}
      <p className="border-line flex items-baseline justify-between border-t px-[8px] pt-[10px]">
        <span className="typo-button2 text-text-normal">이번 판</span>
        <span className="text-brand-primary text-[22px] leading-none font-bold tabular-nums">
          {brokenNow}
          <span className="typo-button2 ml-[2px]">개</span>
        </span>
      </p>
    </section>
  );
}
