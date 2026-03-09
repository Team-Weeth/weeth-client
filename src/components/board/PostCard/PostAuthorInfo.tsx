import Image from 'next/image';
import type { StaticImageData } from 'next/image';
import { PaperclipIcon } from '@/assets/icons';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui';

interface PostAuthorInfoProps {
  author: {
    name: string;
    profileImageUrl?: string;
  };
  date: string;
  dateTime?: string;
  hasAttachment?: boolean;
}

function PostAuthorInfo({ author, date, dateTime, hasAttachment }: PostAuthorInfoProps) {
  return (
    <div className="flex items-center gap-200">
      <Avatar size={24}>
        <AvatarImage src={author.profileImageUrl} alt={author.name} />
        <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <span className="typo-caption1 text-text-normal">{author.name}</span>
      <time className="typo-caption2 text-text-alternative text-right" dateTime={dateTime}>
        {date}
      </time>
      {hasAttachment && (
        <Image src={PaperclipIcon as StaticImageData} alt="첨부파일 있음" width={8} height={9} />
      )}
    </div>
  );
}

export { PostAuthorInfo, type PostAuthorInfoProps };
