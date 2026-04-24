import Image from 'next/image';

import { NewIcon } from '@/assets/icons';
import { cn } from '@/lib/cn';

const ICON_SIZE = {
  list: { width: 7, height: 9 },
  detail: { width: 10, height: 12 },
} as const;

interface PostCardTitleProps {
  title: string;
  isNew?: boolean;
  size: 'list' | 'detail';
}

function PostCardTitle({ title, isNew, size }: PostCardTitleProps) {
  return (
    <div className="flex items-center gap-[5px]">
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
