'use client';

import Image from 'next/image';
import Link from 'next/link';
import DeleteIcon from '@/assets/icons/delete.svg';
import TitleHighlight from '@/assets/image/wax-event/banner_title_highlight.svg';
import TitlePrefix from '@/assets/image/wax-event/banner_title_prefix.svg';
import { Icon } from '@/components/ui/Icon';
import { WAX_EVENT_BANNER_HEIGHT, WAX_EVENT_COPY } from '@/constants/waxEvent';
import { useWaxEventBannerClosed } from '@/hooks/useWaxEventDismissal';
import { cn } from '@/lib/cn';

interface WaxEventTopBannerProps {
  /** 배너를 눌렀을 때 갈 곳(동아리 화면은 이벤트 페이지, 랜딩은 공개 게임 페이지) */
  href: string;
  /** 자체 헤더를 쓰는 모바일 화면에서는 배너를 숨긴다. 이때는 노치 영역을 감싸는 헤더에 맡긴다. */
  hideOnMobile?: boolean;
  className?: string;
}

/**
 * 왁뿌볼 이벤트 상단 띠배너. 배너를 누르면 게임으로 가고, X로 닫으면 다시 보이지 않는다.
 * 배경은 테마와 상관없이 이벤트 색을 쓰고, 부모 너비가 1440px로 막혀 있어도 그림자로 화면 끝까지 칠한다.
 * 노치 영역은 배너가 직접 채우므로(`data-top-banner`) 감싸는 헤더는 배너가 있을 때 pt-safe를 빼야 한다.
 */
function WaxEventTopBanner({ href, hideOnMobile = false, className }: WaxEventTopBannerProps) {
  const { closed, close } = useWaxEventBannerClosed();

  if (closed) return null;

  return (
    <div
      data-top-banner={hideOnMobile ? undefined : ''}
      className={cn(
        'relative bg-[#001714] shadow-[0_0_0_100vmax_#001714] [clip-path:inset(0_-100vmax)]',
        hideOnMobile ? 'max-tablet:hidden' : 'pt-safe',
        className,
      )}
    >
      <Link
        href={href}
        className="tablet:justify-center tablet:px-[64px] flex items-center pr-[64px] pl-450"
        style={{ height: WAX_EVENT_BANNER_HEIGHT }}
      >
        <span className="tablet:flex-row tablet:items-center tablet:gap-500 flex min-w-0 flex-col gap-100">
          <span className="tablet:gap-200 flex shrink-0 items-center gap-100">
            <span className="sr-only">{WAX_EVENT_COPY.bannerTitle}</span>
            <Image
              src={TitlePrefix}
              alt=""
              aria-hidden
              className="tablet:h-[14px] tablet:w-[68px] h-[12px] w-[59px]"
            />
            <Image
              src={TitleHighlight}
              alt=""
              aria-hidden
              className="tablet:h-[24px] tablet:w-[76px] h-[16px] w-[50px]"
            />
          </span>
          <span className="tablet:typo-caption1 tablet:opacity-100 truncate text-[10px] leading-4 font-semibold text-white opacity-60">
            {WAX_EVENT_COPY.bannerDescription}
          </span>
        </span>
      </Link>
      <button
        type="button"
        onClick={close}
        aria-label="이벤트 배너 닫기"
        className="absolute right-450 bottom-[6px] flex cursor-pointer items-center justify-center rounded-sm p-200 text-[#909599] transition-colors hover:text-white"
      >
        <Icon src={DeleteIcon} size={24} />
      </button>
    </div>
  );
}

/** 배너를 고정 헤더 안에 넣은 화면(랜딩)에서 배너가 보이는 동안 본문을 배너 높이만큼 내린다. */
function WaxEventTopBannerSpacer() {
  const { closed } = useWaxEventBannerClosed();
  if (closed) return null;
  return <div aria-hidden className="shrink-0" style={{ height: WAX_EVENT_BANNER_HEIGHT }} />;
}

export { WaxEventTopBanner, WaxEventTopBannerSpacer };
