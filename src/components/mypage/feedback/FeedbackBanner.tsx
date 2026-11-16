import Image, { type StaticImageData } from 'next/image';
import feedbackBannerImg from '@/assets/image/feedback_banner.png';
import { cn } from '@/lib/cn';

/**
 * 서비스 피드백 상단 배너 이미지(Figma contact_banner_blue, 940×214의 2배 PNG).
 * 데스크톱·모바일·다크 모드 모두 이 한 장을 쓰고, 모바일(339×108)은 object-cover로 가운데를 잘라 보여준다.
 */
const FEEDBACK_BANNER_IMAGE: StaticImageData = feedbackBannerImg;

interface FeedbackBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: StaticImageData | string;
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
        // 폭에 비례해 높이를 정하고(940→214) 좁아지면 108에서 멈춰 가운데를 자른다(모바일 339×108).
        'relative aspect-[940/214] min-h-[108px] w-full overflow-hidden rounded-lg',
        className,
      )}
      {...props}
    >
      {/* 모바일은 높이 108에 맞춰 cover로 키우므로 실제 그려지는 폭이 컨테이너보다 넓다(최소 약 475px). */}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 696px) 940px, (min-width: 511px) 100vw, 475px"
        className="object-cover"
      />
    </div>
  );
}

export { FeedbackBanner, FEEDBACK_BANNER_IMAGE, type FeedbackBannerProps };
