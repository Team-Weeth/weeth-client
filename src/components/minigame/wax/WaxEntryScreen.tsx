'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';

/** 진입 화면이 떠 있는 동안 순서대로 반복해서 보여주는 문구 */
const LOADING_MESSAGES = [
  '개강 하는 중···',
  '강의실 불 켜는 중···',
  '빈자리 찾는 중···',
  '왁뿌볼 챙기는 중···',
  '책상 밑에 왁뿌볼 숨기는 중···',
];
const MESSAGE_INTERVAL_MS = 1500;

/**
 * 세로 간격은 시안 세 장(가시 영역 812·636·420px)의 값을 화면 높이에 비례해 잇는다.
 * 812px 이상(데스크톱 포함)은 위에서부터 같은 간격으로 쌓고 남는 공간은 버튼 아래로 둔다.
 * 636px보다 짧으면 일러스트는 270px로 두고 제목·설명·일러스트 영역만 스크롤된다.
 */
const LAYOUT = {
  top: 'clamp(24px, calc(40.9dvh - 222px), 110px)',
  gap: 'clamp(14px, calc(6.8dvh - 29px), 26px)',
  illustration: 'clamp(270px, calc(28.4dvh + 89px), 320px)',
  bottom: 'clamp(0px, calc(9.09dvh - 51.8px), 22px)',
  ctaGap: 'clamp(12px, min(calc(3.41dvh + 10.3px), calc(9.26dvh - 26.9px)), 38px)',
};

/** 대기·로딩 구분 없이 진입 화면이 떠 있는 동안 계속 돈다. */
function LoadingMessage() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(
      () => setIndex((current) => (current + 1) % LOADING_MESSAGES.length),
      MESSAGE_INTERVAL_MS,
    );
    return () => clearInterval(timer);
  }, []);
  return <>{LOADING_MESSAGES[index]}</>;
}

/** 배지·제목·설명 묶음의 높이(줄바꿈이 고정이라 일정하다). 빛 위치 계산에 쓴다. */
const TEXT_BLOCK_HEIGHT = 176;

function Illustration() {
  return (
    <div
      className="relative aspect-square shrink-0"
      style={{ width: LAYOUT.illustration }}
      aria-hidden
    >
      <Image
        src="/images/wax/entry-illustration.png"
        alt=""
        fill
        sizes="320px"
        priority
        className="object-cover"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/wax/entry-shine.svg"
        alt=""
        className="absolute block max-w-none"
        style={{ inset: '66.14% 43.1% 32.18% 53.46%' }}
      />
    </div>
  );
}

/**
 * 게임 진입 화면. 배경·글자는 시안에서 토큰 연결을 해제한 고정값이고, CTA만 디자인 시스템 버튼(라이트 고정)을 쓴다.
 * 로딩 중에는 CTA를 비활성화하고 스피너를 돌린다. 버튼 위 문구는 대기 중에도 계속 순환한다.
 */
export function WaxEntryScreen({
  loading,
  actionLabel,
  onAction,
  error,
}: {
  loading: boolean;
  actionLabel: string;
  onAction: () => void;
  error?: string;
}) {
  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-[#1f2524]">
      {/*
        일러스트 뒤 빛. 스크롤 영역 안에 두면 영역 경계에서 잘려 직선이 보여 배경 층에 둔다.
        위치는 시안의 일러스트 기준 비율(빛 상자 = 일러스트의 195% × 209%, 위로 51.88%)을 그대로 계산한다.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/wax/entry-glow.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 block max-w-none -translate-x-1/2"
        style={{
          width: `calc(${LAYOUT.illustration} * 1.95)`,
          height: `calc(${LAYOUT.illustration} * 2.0876)`,
          top: `calc(${LAYOUT.top} + ${TEXT_BLOCK_HEIGHT}px + ${LAYOUT.gap} - ${LAYOUT.illustration} * 0.5188)`,
        }}
      />
      {/* 내용 높이만큼만 차지하고, 화면이 짧을 때만 줄어들며 스크롤된다(flex-grow 없음). */}
      <div className="relative min-h-0 shrink overflow-x-hidden overflow-y-auto">
        <div
          className="flex flex-col items-center"
          style={{ paddingTop: LAYOUT.top, paddingBottom: LAYOUT.bottom, gap: LAYOUT.gap }}
        >
          <div className="flex w-[296px] max-w-[calc(100%-32px)] flex-col items-center gap-[10px] text-center">
            <p className="typo-caption1 rounded-full bg-[rgba(0,200,170,0.12)] px-[10px] py-[4px] text-[#00fac8]">
              Weeth 미니게임
            </p>
            <h1 className="text-[28px] leading-[36px] font-bold tracking-[0.01em] text-white">
              교수님 몰래
              <br />
              왁뿌하기
            </h1>
            <p className="text-[13px] leading-[20px] font-medium tracking-[-0.005em] text-[#f8f8f8]">
              강의실 책상에 앉으면 왁뿌볼을 깰 수 있어요.
              <br />
              소리가 너무 크면 교수님이
              <br />
              회초리를 들고 다가오니 주의!!
            </p>
          </div>
          <Illustration />
        </div>
      </div>
      <div
        className="relative flex shrink-0 flex-col items-center px-[20px] pt-[8px] pb-[max(20px,env(safe-area-inset-bottom))]"
        style={{ gap: LAYOUT.ctaGap }}
      >
        {/* 문구는 진입 화면이 떠 있는 동안 계속 순서대로 바뀐다. 오류가 있으면 오류 문구를 대신 보여준다. */}
        <p
          role="status"
          className={
            error
              ? 'typo-caption2 text-state-error h-[16px] text-center'
              : 'typo-caption2 h-[16px] text-center text-[#aaa]'
          }
        >
          {error ?? <LoadingMessage />}
        </p>
        <Button
          size="lg"
          disabled={loading}
          aria-label={loading ? '불러오는 중' : actionLabel}
          className="h-[56px] w-full max-w-[335px] p-400"
          onClick={onAction}
        >
          {loading ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/images/wax/loading-spinner.svg"
              alt=""
              width={24}
              height={24}
              className="animate-[wax-spin_2s_linear_infinite] motion-reduce:animate-none"
            />
          ) : (
            actionLabel
          )}
        </Button>
      </div>
    </div>
  );
}
