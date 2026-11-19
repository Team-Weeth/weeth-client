'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { waxRankingApi } from '@/lib/apis/waxRanking';
import { waxDeviceToken } from '@/lib/minigame/waxIdentity';
import { cn } from '@/lib/cn';
import type { WaxRanking, WaxRankingEntry, WaxRankingPeriod } from '@/types/wax';

const PERIODS: { value: WaxRankingPeriod; label: string }[] = [
  { value: 'DAILY', label: '오늘' },
  { value: 'WEEKLY', label: '이번 주' },
];

/** 어느 기간을 불러온 결과인지 함께 둔다. 지금 보는 기간과 다르면 불러오는 중으로 본다. 실패면 ranking이 null이다. */
type Loaded = { period: WaxRankingPeriod; ranking: WaxRanking | null };

function Row({ entry, mine = false }: { entry: WaxRankingEntry; mine?: boolean }) {
  return (
    <li
      className={cn(
        'flex items-center gap-300 rounded-[10px] px-400 py-300',
        mine ? 'bg-button-primary-subtle' : 'bg-background',
      )}
    >
      <span
        className={cn(
          'typo-button1 w-[28px] shrink-0 text-center',
          entry.rank <= 3 ? 'text-brand-primary' : 'text-text-alternative',
        )}
      >
        {entry.rank}
      </span>
      <span className="typo-body2 text-text-strong min-w-0 flex-1 truncate">
        {entry.name}
        {mine && <span className="typo-caption2 text-brand-primary ml-200">나</span>}
      </span>
      <span className="typo-button2 text-text-normal shrink-0">{entry.brokenWaxes}개</span>
    </li>
  );
}

/** 일간·주간 랭킹. 열 때와 기간을 바꿀 때마다 새로 불러온다. 기기 토큰으로 내 순위도 함께 받는다. */
export function WaxRankingDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [period, setPeriod] = useState<WaxRankingPeriod>('DAILY');
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    waxRankingApi
      .get(period, waxDeviceToken())
      .then((response) => !cancelled && setLoaded({ period, ranking: response.data.data }))
      .catch(() => !cancelled && setLoaded({ period, ranking: null }));
    return () => {
      cancelled = true;
    };
  }, [open, period]);

  const current = loaded?.period === period ? loaded : null;
  const ranking = current?.ranking ?? null;
  const load = { status: !current ? 'loading' : ranking ? 'done' : 'error' };
  const meInTop = ranking?.me && ranking.rankings.some((entry) => entry.rank === ranking.me?.rank);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent showCloseButton={false} className="w-[min(calc(100vw-32px),343px)]">
        <DialogHeader title="왁뿌볼 랭킹" showClose onClose={onClose} />
        <Tabs value={period} onValueChange={(value) => setPeriod(value as WaxRankingPeriod)}>
          <TabsList className="w-full">
            {PERIODS.map((item) => (
              <TabsTrigger key={item.value} value={item.value} className="flex-1">
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex max-h-[min(420px,calc(100dvh-280px))] min-h-[120px] flex-col gap-200 overflow-y-auto pt-400">
          {load.status === 'loading' && (
            <p className="typo-body2 text-text-alternative py-600 text-center">불러오는 중…</p>
          )}
          {load.status === 'error' && (
            <p className="typo-body2 text-state-error py-600 text-center">
              랭킹을 불러오지 못했어요.
            </p>
          )}
          {ranking && ranking.rankings.length === 0 && (
            <p className="typo-body2 text-text-alternative py-600 text-center">
              아직 기록이 없어요.
              <br />첫 기록의 주인공이 되어보세요!
            </p>
          )}
          {ranking && ranking.rankings.length > 0 && (
            <ol className="flex flex-col gap-200" aria-label="순위">
              {ranking.rankings.map((entry) => (
                <Row key={entry.rank} entry={entry} mine={entry.rank === ranking.me?.rank} />
              ))}
            </ol>
          )}
          {ranking?.me && !meInTop && (
            <div className="flex flex-col gap-200 pt-200">
              <p className="typo-caption1 text-text-alternative">내 순위</p>
              <ul>
                <Row entry={ranking.me} mine />
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
