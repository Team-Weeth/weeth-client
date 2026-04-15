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
        className="h-[364px] w-full"
      />
    );
  }

  return (
    <div
      className="h-[364px] w-full"
      style={{
        background: `linear-gradient(30deg, rgba(30, 32, 33, 0) 0%, rgba(30, 32, 33, 0.8) 100%), var(--neutral-700)`,
      }}
    />
  );
}
