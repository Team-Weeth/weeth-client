import Image from 'next/image';

import { NewIcon } from '@/assets/icons';
import { cn } from '@/lib/cn';

const ICON_SIZE = {
  list: { width: 7, height: 9 },
  detail: { width: 11, height: 13 },
} as const;

interface PostCardTitleProps {
  title: string;
  isNew?: boolean;
  size: 'list' | 'detail';
}

function PostCardTitle({ title, isNew, size }: PostCardTitleProps) {
  return (
    <div className={cn('flex items-center', size === 'detail' ? 'gap-[10px]' : 'gap-[5px]')}>
      <h3 className={cn('text-text-strong', size === 'detail' ? 'typo-md-title' : 'typo-sub3')}>
        {title}
      </h3>
      {isNew && (
        <>
          <Image src={NewIcon} alt="" {...ICON_SIZE[size]} aria-hidden />
          <span className="sr-only">새 글</span>
        </>
      )}
    </div>
  );
}

export { PostCardTitle, type PostCardTitleProps };
