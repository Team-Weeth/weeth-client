import type { StaticImageData } from 'next/image';
import { PaperclipIcon } from '@/assets/icons';
import { Avatar, AvatarImage, AvatarFallback, Divider } from '@/components/ui';
import { cn } from '@/lib/cn';

interface PostAuthorInfoProps {
  className?: string;
  author: {
    name: string;
    profileImageUrl?: string;
  };
  date: string;
  dateTime?: string;
  hasAttachment?: boolean;
}

function PostAuthorInfo({ className, author, date, dateTime, hasAttachment }: PostAuthorInfoProps) {
  return (
    <div className={cn('flex items-center gap-200', className)}>
      <Avatar size={24}>
        <AvatarImage src={author.profileImageUrl} alt={author.name} />
        <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <span className="typo-caption1 text-text-normal">{author.name}</span>
      <Divider orientation="vertical" className="h-3" />
      <time className="typo-caption2 text-text-alternative text-right" dateTime={dateTime}>
        {date}
      </time>
      {hasAttachment && (
        <>
          <Divider orientation="vertical" className="h-3" />
          <span
            role="img"
            aria-label="첨부파일 있음"
            className="bg-icon-alternative block h-[9px] w-[8px] mask-contain mask-center mask-no-repeat"
            style={{
              maskImage: `url(${(PaperclipIcon as StaticImageData).src})`,
              WebkitMaskImage: `url(${(PaperclipIcon as StaticImageData).src})`,
            }}
          />
        </>
      )}
    </div>
  );
}

export { PostAuthorInfo, type PostAuthorInfoProps };
