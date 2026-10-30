import Image, { type StaticImageData } from 'next/image';
import { cn } from '@/lib/cn';

/**
 * 서비스 피드백 상단 배너 이미지. 최종 에셋이 나오기 전까지는 비워 두고 중립 플레이스홀더를 보여준다.
 * 에셋이 준비되면 이미지를 import해 이 값만 교체하면 된다.
 */
const FEEDBACK_BANNER_IMAGE: StaticImageData | null = null;

interface FeedbackBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: StaticImageData | string | null;
  alt?: string;
}

function FeedbackBanner({
  src = FEEDBACK_BANNER_IMAGE,
  alt = '',
  className,
  ...props
}: FeedbackBannerProps) {
  return (
    <div
      className={cn(
        'tablet:h-[214px] relative h-[108px] w-full overflow-hidden rounded-lg',
        !src && 'bg-container-neutral-interaction',
        className,
      )}
      aria-hidden={src ? undefined : true}
      {...props}
    >
      {src && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 696px) 940px, 100vw"
          className="object-cover"
        />
      )}
    </div>
  );
}

export { FeedbackBanner, FEEDBACK_BANNER_IMAGE, type FeedbackBannerProps };
