'use client';

import { ReplyIcon } from '@/assets/icons';
import { Avatar, AvatarFallback, AvatarImage, Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import { ActionMenu } from '@/components/board/ActionMenu';
import { FileList } from '@/components/board/FileList';
import type { DisplayFile } from '@/types/board';

interface ReplyItemProps {
  id: number | string;
  className?: string;
  profileImage?: string;
  name: string;
  content: string;
  date: string;
  isAuthor?: boolean;
  files?: DisplayFile[];
  onEdit?: () => void;
  onDelete?: () => void;
}

function ReplyItem({
  className,
  profileImage,
  name,
  content,
  date,
  isAuthor,
  files,
  onEdit,
  onDelete,
}: ReplyItemProps) {
  return (
    <div className={cn('flex items-start justify-between gap-100 self-stretch px-450', className)}>
      <Icon src={ReplyIcon} size={20} className="text-icon-alternative" />
      <div className="bg-container-neutral-alternative relative flex-1 rounded-lg p-400">
        <div className="flex flex-col gap-200">
          <div className="flex items-center gap-[5px]">
            <Avatar size={24}>
              {profileImage && <AvatarImage src={profileImage} alt={name} />}
              <AvatarFallback>{name[0]}</AvatarFallback>
            </Avatar>
            <span className="typo-sub2 text-text-strong">{name}</span>
          </div>
          <p className="typo-body1 text-text-normal whitespace-pre-wrap">{content}</p>
          {files && files.length > 0 && <FileList files={files} />}
          <p className="typo-caption2 text-text-alternative">{date}</p>
        </div>
        {isAuthor && (
          <ActionMenu
            triggerVariant="secondary"
            triggerClassName="absolute top-400 right-400 size-6"
            onEdit={onEdit}
            onDeleteSelect={onDelete}
          />
        )}
      </div>
    </div>
  );
}

export { ReplyItem, type ReplyItemProps };
