import Image from 'next/image';
import type { StaticImageData } from 'next/image';
import { PaperclipIcon } from '@/assets/icons';

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
      <div className="bg-container-neutral-interaction h-6 w-6 shrink-0 overflow-hidden rounded-full">
        {author.profileImageUrl && (
          // TODO: API 연결 후 실제 URL로 변경되면 next/image로 교체
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={author.profileImageUrl}
            alt={author.name}
            className="h-full w-full object-cover"
          />
        )}
      </div>
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
