'use client';

import { Fragment, useState } from 'react';
import { LogOut, VolumeX } from 'lucide-react';
import { WAX_EMOTES } from '@/constants/wax';
import { cn } from '@/lib/cn';
import type { CSSProperties, ReactNode } from 'react';
import type { WaxEmoteKind, WaxProfessorMode } from '@/types/wax';

const IMAGES = '/images/wax';

/** 디자인 에셋(SVG·스프라이트)을 원본 크기 그대로 그린다. 최적화할 필요가 없는 작은 정적 파일이다. */
function Asset({
  src,
  width,
  height,
  className,
  style,
}: {
  src: string;
  width?: number;
  height?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${IMAGES}/${src}`}
      alt=""
      width={width}
      height={height}
      draggable={false}
      className={cn('pointer-events-none block max-w-none', className)}
      style={style}
    />
  );
}

/**
 * reactions.png(가로 4칸) 중 한 칸을 상자 크기에 맞춰 보여준다. 위치는 Figma 컴포넌트의 비율을 그대로 쓴다.
 * 마지막 칸(Smile)만 원본에서 살짝 크게 잘려 있다.
 */
const SPRITE_CROPS: CSSProperties[] = [
  { width: '393.75%', height: '131.25%', top: '-17.2%', left: '0%' },
  { width: '393.75%', height: '131.25%', top: '-17.2%', left: '-100%' },
  { width: '393.75%', height: '131.25%', top: '-17.2%', left: '-196.875%' },
  { width: '406.45%', height: '135.48%', top: '-16.13%', right: '0%' },
];

export function ReactionSprite({ index, className }: { index: number; className?: string }) {
  return (
    <span className={cn('relative block overflow-hidden', className)}>
      <Asset src="reactions.png" className="absolute object-cover" style={SPRITE_CROPS[index]} />
    </span>
  );
}

/**
 * 화면 왼쪽 위: Weeth 로고와 지금 있는 공간. 모바일은 오른쪽 조작 버튼과 함께 한 줄에 들어가도록
 * 짧은 이름(호실)만 보여주고, 그래도 모자라면 말줄임으로 줄인다.
 */
export function ClassroomBadge({
  label,
  shortLabel = label,
  href,
}: {
  label: string;
  shortLabel?: string;
  href: string;
}) {
  return (
    <div className="bg-container-neutral pointer-events-auto flex min-w-0 items-center gap-[12px] rounded-[10px] py-[8px] pr-[14px] pl-[12px]">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label="Weeth 알아보기"
        className="shrink-0"
      >
        <Asset src="logo.svg" width={54} height={24} />
      </a>
      {/* 360px 미만(아주 좁은 화면)은 오른쪽 버튼 자리가 모자라 로고만 둔다. */}
      <Asset src="divider.svg" width={1} height={26} className="shrink-0 max-[359px]:hidden" />
      <span className="typo-button2 text-text-normal tablet:hidden min-w-0 truncate max-[359px]:hidden">
        {shortLabel}
      </span>
      <span className="typo-button2 text-text-normal tablet:inline hidden min-w-0 truncate">
        {label}
      </span>
    </div>
  );
}

/** 화면 오른쪽 위: 접속 인원, 소리, 시점 전환, 나가기. */
export function RoomControls({
  players,
  muted,
  firstPerson,
  onToggleMute,
  onToggleView,
  onExit,
}: {
  players: number;
  muted: boolean;
  firstPerson: boolean;
  onToggleMute: () => void;
  onToggleView: () => void;
  onExit: () => void;
}) {
  return (
    <div className="bg-container-neutral pointer-events-auto flex shrink-0 items-center rounded-[10px] pr-[2px] pl-[8px]">
      <span
        className="flex h-[42px] w-[46px] items-center justify-center gap-[3px]"
        aria-label={`접속 ${players}명`}
      >
        <Asset src="people.svg" width={18} height={18} />
        <span className="text-text-normal text-[13px] font-medium">{players}</span>
      </span>
      <button
        type="button"
        aria-label={muted ? '소리 켜기' : '소리 끄기'}
        className="grid size-[42px] place-items-center"
        onClick={onToggleMute}
      >
        {/* 음소거 아이콘은 시안에 없어 같은 lucide 계열 아이콘을 같은 굵기로 쓴다. */}
        {muted ? (
          <VolumeX className="text-text-normal size-[20px]" strokeWidth={1.8} />
        ) : (
          <Asset src="sound-on.svg" width={20} height={20} />
        )}
      </button>
      <button
        type="button"
        aria-label={firstPerson ? '3인칭으로 보기' : '1인칭으로 보기'}
        className="grid size-[42px] place-items-center"
        onClick={onToggleView}
      >
        <Asset src="visibility.svg" width={20} height={20} />
      </button>
      {/* 나가기는 시안에 없어 다른 버튼과 같은 lucide 계열·굵기로 맞춘다. */}
      <button
        type="button"
        aria-label="나가기"
        className="grid size-[42px] place-items-center"
        onClick={onExit}
      >
        <LogOut className="text-text-normal size-[20px]" strokeWidth={1.8} />
      </button>
    </div>
  );
}

export function HelpButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      aria-label="도움말"
      className={cn(
        'bg-container-neutral pointer-events-auto grid size-[40px] place-items-center rounded-full',
        className,
      )}
      onClick={onClick}
    >
      <Asset src="help.svg" width={28} height={28} />
    </button>
  );
}

/** 화면 오른쪽 세로 감정 표현 패널. 순서가 키보드 1~4 단축키다. */
export function ReactionPanel({
  onEmote,
  className,
}: {
  onEmote: (kind: WaxEmoteKind) => void;
  className?: string;
}) {
  return (
    <nav
      aria-label="감정 표현"
      // 패널 배경은 시안에서 토큰에 연결되지 않은 고정 색이다.
      className={cn(
        'pointer-events-auto flex flex-col items-center gap-[10px] rounded-[14px] bg-[#151515] px-[8px] py-[12px]',
        className,
      )}
    >
      {WAX_EMOTES.map((emote, index) => (
        <Fragment key={emote.kind}>
          {index > 0 && (
            <span className="flex h-0 w-[34px] items-center justify-center">
              <Asset src="reaction-divider.svg" width={1} height={34} className="-rotate-90" />
            </span>
          )}
          <button
            type="button"
            aria-label={`${emote.label} 보내기 (${index + 1})`}
            className="transition-transform active:scale-90"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onEmote(emote.kind)}
          >
            <ReactionSprite index={emote.sprite} className="size-[40px]" />
          </button>
        </Fragment>
      ))}
    </nav>
  );
}

const DEPTH_TONE = {
  primary: {
    depth: 'bg-container-primary',
    face: 'border-container-primary',
    text: 'text-brand-primary',
    keycap: 'bg-brand-primary',
  },
  neutral: {
    depth: 'bg-neutral-600',
    face: 'border-neutral-600',
    text: 'text-neutral-700',
    keycap: 'bg-neutral-700',
  },
} as const;

/**
 * 아래쪽에 입체 테두리가 있는 게임 버튼. 누르는 동안 테두리를 숨기고 표면을 7px 내려 딸깍 눌린 느낌을 준다.
 * 버튼 높이(55px)는 그대로라 주변 UI가 밀리지 않는다. PC는 단축키 키캡을 글자 앞에 붙인다.
 */
export function DepthButton({
  tone,
  label,
  shortcut,
  className,
  onClick,
}: {
  tone: keyof typeof DEPTH_TONE;
  label: string;
  /** 없으면(모바일) 키캡을 그리지 않는다. */
  shortcut?: string;
  className?: string;
  onClick: () => void;
}) {
  const [pressed, setPressed] = useState(false);
  const colors = DEPTH_TONE[tone];
  return (
    <button
      type="button"
      data-pressed={pressed}
      className={cn(
        'pointer-events-auto relative flex h-[55px] shrink-0 flex-col overflow-hidden',
        pressed ? 'pt-[7px]' : 'pb-[7px]',
        className,
      )}
      onPointerDown={(event) => {
        event.stopPropagation();
        setPressed(true);
      }}
      onPointerUp={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onClick={onClick}
    >
      {!pressed && (
        <span className={cn('absolute inset-x-0 top-[7px] bottom-0 rounded-[9px]', colors.depth)} />
      )}
      <span
        className={cn(
          'bg-container-neutral relative flex h-[48px] w-full shrink-0 items-center justify-center gap-[6px] rounded-[10px] border-2',
          colors.face,
        )}
      >
        {shortcut && (
          <span
            aria-hidden
            className={cn(
              'typo-caption1 text-container-neutral grid size-[20px] place-items-center rounded-[5px]',
              colors.keycap,
            )}
          >
            {shortcut}
          </span>
        )}
        <span className={cn('typo-button2 whitespace-nowrap', colors.text)}>{label}</span>
      </span>
    </button>
  );
}

/**
 * 교수님 상태 알림. 배경색은 시안에서 토큰에 연결되지 않은 고정 색이다.
 * returning(교단으로 돌아가는 중)은 시안에 없어 경계 강도가 같은 '돌아보는 중' 스타일을 쓴다.
 */
const PROFESSOR_ALERT: Record<
  WaxProfessorMode,
  { text: string; icon: 'edit' | 'person' | 'caution' | 'collision'; className: string }
> = {
  writing: {
    text: '교수님 판서 중...',
    icon: 'edit',
    className: 'border-brand-primary bg-[#f7fff6] px-[10px] text-[#526561]',
  },
  turning: {
    text: '어흠.. 교수님이 돌아본다',
    icon: 'person',
    className: 'border-state-caution bg-[#fff3d4] px-[10px] text-[#ff8e15]',
  },
  watching: {
    text: '교수님이 보고 있다!',
    icon: 'caution',
    className: 'border-state-error bg-[#ffe1df] px-[10px] text-state-error',
  },
  chasing: {
    text: '교수님한테 들켰다!',
    icon: 'caution',
    className: 'border-state-error bg-[#ffe1df] px-[10px] text-state-error',
  },
  whacking: {
    text: '딱!!',
    icon: 'collision',
    className: 'border-state-error bg-[#ffe1df] px-[8px] text-state-error',
  },
  returning: {
    text: '교수님이 교단으로 돌아가는 중',
    icon: 'person',
    className: 'border-state-caution bg-[#fff3d4] px-[10px] text-[#ff8e15]',
  },
};

export function ProfessorAlert({
  mode,
  className,
  style,
}: {
  mode: WaxProfessorMode;
  className?: string;
  style?: CSSProperties;
}) {
  const alert = PROFESSOR_ALERT[mode];
  return (
    <div
      role="status"
      style={style}
      className={cn(
        'flex items-end gap-[2px] rounded-full border py-[6px] whitespace-nowrap',
        alert.className,
        className,
      )}
    >
      {alert.icon === 'collision' ? (
        <span className="relative size-[14px] shrink-0">
          <Asset
            src="icon-collision.svg"
            className="absolute"
            style={{ inset: '6.25% 7.54% 6.22% 9.4%', width: 'auto', height: 'auto' }}
          />
        </span>
      ) : (
        <Asset src={`icon-${alert.icon}.svg`} width={14} height={14} className="shrink-0" />
      )}
      <span className="typo-caption1">{alert.text}</span>
    </div>
  );
}

/** 오른쪽 세로 소리 게이지. 아래에서 위로 채우고, 판정 기준(40·70)에 맞춰 색을 바꾼다. */
export function NoiseIndicator({ noise, className }: { noise: number; className?: string }) {
  const value = Math.min(100, Math.max(0, noise));
  return (
    <div
      className={cn('flex flex-col items-center gap-[6px]', className)}
      aria-label={`소리 ${Math.round(value)}`}
    >
      <span className="typo-caption1 text-text-normal">소리</span>
      <div className="border-line bg-container-neutral relative h-[min(286px,calc(100dvh-220px))] w-[14px] overflow-hidden rounded-full border">
        <div
          className={cn(
            'absolute bottom-0 left-0 w-full rounded-full transition-[height] duration-100',
            value > 70 ? 'bg-state-error' : value > 40 ? 'bg-state-caution' : 'bg-brand-primary',
          )}
          style={{ height: `${value}%` }}
        />
      </div>
    </div>
  );
}

/** GNB 아래 가운데 안내 배지(쫓겨남·재연결). 너비는 문구에 맞추되 화면을 넘지 않는다. */
export function NoticeBadge({
  kind,
  children,
}: {
  kind: 'ejected' | 'reconnecting';
  children: ReactNode;
}) {
  return (
    <div
      role="status"
      className={cn(
        'bg-container-neutral flex max-w-full items-center gap-[12px] overflow-hidden rounded-full px-[16px] py-[6px]',
        kind === 'ejected' && 'border-container-primary border',
      )}
    >
      <span className="relative h-[31px] w-[32px] shrink-0 overflow-hidden">
        {kind === 'ejected' ? (
          <Asset
            src="out-badge.png"
            className="absolute"
            style={{ width: '432.55%', height: '148.84%', left: '-3.13%', top: '-20.47%' }}
          />
        ) : (
          <Asset
            src="loading-badge.png"
            className="absolute"
            style={{ width: '189.52%', height: '130.42%', left: '-45.3%', top: '-20.53%' }}
          />
        )}
      </span>
      {/* 평소에는 문구 길이에 맞추고(Hug), 화면보다 길 때만 단어 단위로 줄을 바꾼다. */}
      <p className="typo-caption2 text-text-normal min-w-0 break-keep">{children}</p>
    </div>
  );
}
