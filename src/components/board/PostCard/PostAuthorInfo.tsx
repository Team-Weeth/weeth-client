import { PaperclipIcon } from '@/assets/icons';
import { Avatar, AvatarImage, AvatarFallback, Divider, Icon } from '@/components/ui';
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
        <AvatarFallback />
      </Avatar>
      <span className="typo-caption1 text-text-normal">{author.name}</span>
      <Divider orientation="vertical" className="h-3" />
      <time className="typo-caption2 text-text-alternative text-right" dateTime={dateTime}>
        {date}
      </time>
      {hasAttachment && (
        <>
          <Divider orientation="vertical" className="h-3" />
          <Icon
            src={PaperclipIcon}
            size={9}
            alt="첨부파일 있음"
            className="text-icon-alternative"
          />
        </>
      )}
    </div>
  );
}

export { PostAuthorInfo, type PostAuthorInfoProps };
