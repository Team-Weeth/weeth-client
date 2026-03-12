import type { StaticImageData } from 'next/image';
import { MoreVerticalIcon, ReplyIcon } from '@/assets/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';

interface ReplyItemProps {
  profileImage?: string;
  name: string;
  content: string;
  date: string;
  isAuthor?: boolean;
  onMore?: () => void;
}

function ReplyItem({ profileImage, name, content, date, isAuthor, onMore }: ReplyItemProps) {
  return (
    <div className="flex items-start justify-between self-stretch px-450">
      <span
        aria-hidden
        className="bg-icon-alternative block size-5 shrink-0 mask-contain mask-center mask-no-repeat"
        style={{
          maskImage: `url(${(ReplyIcon as StaticImageData).src})`,
          WebkitMaskImage: `url(${(ReplyIcon as StaticImageData).src})`,
        }}
      />
      <div className="relative flex-1 rounded-lg bg-container-neutral-alternative p-400">
        <div className="flex flex-col gap-200">
          <div className="flex items-center gap-[5px]">
            <Avatar size={24}>
              {profileImage && <AvatarImage src={profileImage} alt={name} />}
              <AvatarFallback>{name[0]}</AvatarFallback>
            </Avatar>
            <span className="typo-sub2 text-text-strong">{name}</span>
          </div>
          <p className="typo-body1 text-text-normal">{content}</p>
          <p className="typo-caption2 text-text-alternative">{date}</p>
        </div>
        {isAuthor && (
          <button
            type="button"
            className="absolute right-400 top-400 flex size-6 items-center justify-center rounded-sm bg-button-neutral"
            onClick={onMore}
            aria-label="더보기"
          >
            <span
              aria-hidden
              className="bg-icon-normal block h-4 w-1 mask-contain mask-center mask-no-repeat"
              style={{
                maskImage: `url(${(MoreVerticalIcon as StaticImageData).src})`,
                WebkitMaskImage: `url(${(MoreVerticalIcon as StaticImageData).src})`,
              }}
            />
          </button>
        )}
      </div>
    </div>
  );
}

export { ReplyItem, type ReplyItemProps };
