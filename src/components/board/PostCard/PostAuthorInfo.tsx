import PaperclipIcon from '@/assets/icons/paperclip.svg';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Divider } from '@/components/ui/Divider';
import { Icon } from '@/components/ui/Icon';
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
  /** 작성자(아바타+이름) 클릭 시 호출 — 전달 시에만 클릭 가능해진다 */
  onAuthorClick?: () => void;
}

function PostAuthorInfo({
  className,
  author,
  date,
  dateTime,
  hasAttachment,
  onAuthorClick,
}: PostAuthorInfoProps) {
  const authorContent = (
    <>
      <Avatar size={24}>
        <AvatarImage src={author.profileImageUrl} alt={author.name} />
        <AvatarFallback />
      </Avatar>
      <span className="typo-caption1 text-text-normal">{author.name}</span>
    </>
  );

  return (
    <div className={cn('flex items-center gap-200', className)}>
      {onAuthorClick ? (
        <button
          type="button"
          onClick={onAuthorClick}
          className="flex cursor-pointer items-center gap-200"
          aria-label={`${author.name} 프로필 보기`}
        >
          {authorContent}
        </button>
      ) : (
        authorContent
      )}
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
