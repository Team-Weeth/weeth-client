'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

import { Button } from '@/components/ui/Button';

// 배포로 .next 아티팩트가 교체되면 구 빌드의 청크 URL이 404가 된다.
// 브라우저마다 문구가 달라 모두 커버한다. (Safari: Importing a module script failed)
const STALE_CHUNK_PATTERN =
  /ChunkLoadError|Loading chunk .* failed|dynamically imported module|Importing a module script failed/i;

const RELOAD_AT_KEY = 'weeth-stale-chunk-reload-at';
const RELOAD_COOLDOWN_MS = 10_000;

// 운영에서는 사용자에게 원문 에러를 노출하지 않는다. 원문은 Sentry로만 보낸다.
const isProduction = process.env.NEXT_PUBLIC_APP_ENV === 'production';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  useEffect(() => {
    if (!STALE_CHUNK_PATTERN.test(error.message)) return;

    // 새로고침하면 새 빌드를 받으므로 자동 복구를 시도한다.
    // 쿨다운으로 무한 새로고침을 막는다.
    try {
      const lastReloadAt = Number(sessionStorage.getItem(RELOAD_AT_KEY) ?? 0);
      if (Date.now() - lastReloadAt < RELOAD_COOLDOWN_MS) return;
      sessionStorage.setItem(RELOAD_AT_KEY, String(Date.now()));
    } catch {
      // 스토리지 접근이 차단된 환경에서는 자동 복구를 포기하고 수동 재시도에 맡긴다
      return;
    }

    window.location.reload();
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-400 px-400">
      <p className="typo-body1 text-text-normal text-center">
        화면을 불러오지 못했어요.
        <br />
        잠시 후 다시 시도해주세요.
      </p>
      <Button variant="secondary" size="md" onClick={reset}>
        다시 시도
      </Button>
      {!isProduction && (
        <p className="typo-caption2 text-text-alternative max-w-full text-center break-all">
          {error.message}
        </p>
      )}
      {error.digest && <p className="typo-caption2 text-text-disabled">오류 코드 {error.digest}</p>}
    </div>
  );
}
