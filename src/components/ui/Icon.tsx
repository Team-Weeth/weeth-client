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
        maskImage: `url(${src.src})`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskImage: `url(${src.src})`,
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
      }}
    />
  );
}

export { Icon, type IconProps };
