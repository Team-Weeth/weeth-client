'use client';

import { useRouter } from 'next/navigation';
import type { StaticImageData } from 'next/image';
import { ArrowLeftIcon } from '@/assets/icons';
import { cn } from '@/lib/cn';

interface PostDetailHeaderProps {
  className?: string;
}

function PostDetailHeader({ className }: PostDetailHeaderProps) {
  const router = useRouter();

  return (
    <div className={cn('flex items-start gap-200 self-stretch px-450 pt-450 pb-300', className)}>
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="뒤로 가기"
        className="cursor-pointer p-200"
      >
        <span
          aria-hidden
          className="bg-icon-alternative block h-[7.45px] w-[4.39px] mask-contain mask-center mask-no-repeat"
          style={{
            maskImage: `url(${(ArrowLeftIcon as StaticImageData).src})`,
            WebkitMaskImage: `url(${(ArrowLeftIcon as StaticImageData).src})`,
          }}
        />
      </button>
    </div>
  );
}

export { PostDetailHeader, type PostDetailHeaderProps };
