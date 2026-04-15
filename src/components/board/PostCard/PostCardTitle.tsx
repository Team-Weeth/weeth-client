import Image from 'next/image';

import { NewIcon } from '@/assets/icons';
import { cn } from '@/lib/cn';

interface PostCardTitleProps {
  title: string;
  isNew?: boolean;
  size: 'list' | 'detail';
}

function PostCardTitle({ title, isNew, size }: PostCardTitleProps) {
  return (
    <div className="flex items-center gap-[5px]">
      <h3 className={cn('text-text-strong', size === 'detail' ? 'typo-h3' : 'typo-sub3')}>
        {title}
      </h3>
      {isNew && (
        <>
          <Image src={NewIcon} alt="" width={7} height={9} aria-hidden />
          <span className="sr-only">새 글</span>
        </>
      )}
    </div>
  );
}

export { PostCardTitle, type PostCardTitleProps };
