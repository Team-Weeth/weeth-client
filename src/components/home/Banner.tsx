'use client';

import Image from 'next/image';
import { useHomeQuery } from '@/hooks/home';

export function Banner() {
  const { data: backgroundImageUrl } = useHomeQuery({
    select: (data) => data.club.backgroundImageUrl,
  });

  if (backgroundImageUrl) {
    return (
      <Image
        src={backgroundImageUrl}
        alt="banner"
        width={1440}
        height={364}
        className="tablet:h-[364px] h-[134px] w-full"
      />
    );
  }

  return (
    <div
      className="tablet:h-[364px] h-[134px] w-full"
      style={{
        background: `linear-gradient(30deg, rgba(30, 32, 33, 0) 0%, rgba(30, 32, 33, 0.8) 100%), var(--neutral-700)`,
      }}
    />
  );
}
