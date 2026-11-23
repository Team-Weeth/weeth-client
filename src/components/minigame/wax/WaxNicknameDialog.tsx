'use client';

import { useId, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Input } from '@/components/ui/Input';
import { savedWaxNickname, waxNicknameError } from '@/lib/minigame/waxIdentity';

/**
 * 입장 전 닉네임 결정 모달. 서버가 보낸 추천 이름으로 바로 들어가거나 직접 입력해 들어간다.
 * 직접 입력은 서버와 같은 규칙(2~8자 한글·영문·숫자)으로 먼저 거르고, 서버가 거절하면 그 문구를 보여준다.
 */
export function WaxNicknameDialog({
  open,
  suggestion,
  serverError,
  onEnter,
  onCancel,
}: {
  open: boolean;
  suggestion: string | null;
  serverError?: string;
  onEnter: (name: string) => void;
  onCancel: () => void;
}) {
  // 지난번에 직접 입력한 이름을 미리 채운다.
  const [custom, setCustom] = useState(() => savedWaxNickname() ?? '');
  const [touched, setTouched] = useState(false);
  /** 서버 거절 문구를 보여줄지. 이름을 고쳐 입력하기 시작하면 숨긴다. */
  const [showServerError, setShowServerError] = useState(false);
  const errorId = useId();
  const trimmed = custom.trim();
  const localError = trimmed ? waxNicknameError(trimmed) : null;
  const error = (touched && localError) || (showServerError && serverError) || null;

  // 서버가 거절한 이름은 입력칸에서 지운다. 입장할 때마다 부모가 문구를 비우므로 같은 문구로 다시 거절돼도 다시 지운다.
  // effect 대신 렌더 중에 이전 값과 비교해, 지운 입력칸이 한 번 더 그려지지 않게 한다.
  const [seenServerError, setSeenServerError] = useState(serverError);
  if (serverError !== seenServerError) {
    setSeenServerError(serverError);
    if (serverError) {
      setCustom('');
      setTouched(false);
      setShowServerError(true);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent showCloseButton={false} className="w-[min(calc(100vw-32px),343px)]">
        <DialogHeader
          title="닉네임 정하기"
          description="교실과 랭킹에서 이 이름으로 보여요."
          showClose
          onClose={onCancel}
        />
        <section className="bg-background flex flex-col items-center gap-300 rounded-[10px] px-400 py-400">
          <p className="typo-caption1 text-text-alternative">추천 닉네임</p>
          <p
            className="typo-sub1 text-text-strong min-h-[28px] text-center"
            data-testid="wax-suggestion"
          >
            {suggestion ?? '이름을 고르는 중…'}
          </p>
          <Button
            className="w-full"
            disabled={!suggestion}
            onClick={() => suggestion && onEnter(suggestion)}
          >
            이 이름으로 입장
          </Button>
        </section>
        <p className="typo-caption2 text-text-alternative py-300 text-center">또는 직접 입력</p>
        <form
          className="flex flex-col gap-200"
          onSubmit={(event) => {
            event.preventDefault();
            setTouched(true);
            if (trimmed && !localError) onEnter(trimmed);
          }}
        >
          <Input
            aria-label="닉네임 직접 입력"
            placeholder="2~8자 한글·영문·숫자"
            value={custom}
            maxLength={8}
            error={Boolean(error)}
            aria-describedby={errorId}
            // 기본 입력칸은 모달과 같은 배경이라 묻힌다. 다른 화면의 입력칸처럼 회색 배경으로 구분한다.
            className="typo-body1 bg-container-neutral-alternative h-[48px] px-400"
            onChange={(event) => {
              setCustom(event.target.value);
              setShowServerError(false);
            }}
            onBlur={() => setTouched(true)}
          />
          <p
            id={errorId}
            role={error ? 'alert' : undefined}
            className={
              error
                ? 'typo-caption2 text-state-error min-h-[16px]'
                : 'typo-caption2 text-text-alternative min-h-[16px]'
            }
          >
            {error ?? '띄어쓰기와 특수문자는 쓸 수 없어요.'}
          </p>
          <Button
            type="submit"
            variant="secondary"
            className="w-full"
            disabled={!trimmed || Boolean(localError)}
          >
            직접 입력한 이름으로 입장
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
