import type { StaticImageData } from 'next/image';

import { cn } from '@/lib/cn';

interface IconProps {
  src: StaticImageData;
  size?: number;
  alt?: string;
  className?: string;
}

function Icon({ src, size = 20, alt, className }: IconProps) {
  return (
    <span
      role={alt ? 'img' : undefined}
      aria-label={alt}
      className={cn('inline-block shrink-0 bg-current', className)}
      style={{
        width: size,
        height: size,
        backgroundOrigin: 'content-box',
        backgroundClip: 'content-box',
        maskImage: `url(${src.src})`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        maskOrigin: 'content-box',
        maskClip: 'content-box',
        WebkitMaskImage: `url(${src.src})`,
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        WebkitMaskOrigin: 'content-box',
        WebkitMaskClip: 'content-box',
      }}
    />
  );
}

export { Icon, type IconProps };
