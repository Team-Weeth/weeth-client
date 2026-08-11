'use client';

import {
  Icon,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Divider,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui';
import CameraIcon from '@/assets/icons/camera.svg';
import { useImagePreview } from '@/hooks/mypage';
import { cn } from '@/lib/cn';
import type { AvatarProps } from '@/components/ui';

interface ProfileImageEditorProps {
  name: string;
  profileImageUrl?: string;
  onFileChange?: (file: File) => void;
  onResetImage?: () => void;
  className?: string;
  avatarSize?: AvatarProps['size'];
  avatarClassName?: string;
  fallbackClassName?: string;
  triggerClassName?: string;
  triggerIconClassName?: string;
  triggerIconSize?: number;
  showResetAction?: boolean;
}

function ProfileImageEditor({
  name,
  profileImageUrl,
  onFileChange,
  onResetImage,
  className,
  avatarSize = 128,
  avatarClassName,
  fallbackClassName,
  triggerClassName,
  triggerIconClassName,
  triggerIconSize = 16,
  showResetAction = true,
}: ProfileImageEditorProps) {
  const { fileInputRef, displayUrl, handleChange, handleReset } = useImagePreview({
    initialImageUrl: profileImageUrl,
    onFileChange,
    onResetImage,
  });

  return (
    <div className={cn('relative inline-block', className)}>
      <Avatar size={avatarSize} type="round" className={avatarClassName}>
        <AvatarImage
          key={displayUrl ?? 'fallback'}
          src={displayUrl ?? undefined}
          alt={name}
          className="object-cover"
        />
        <AvatarFallback className={fallbackClassName} />
      </Avatar>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-label="프로필 이미지 선택"
        onChange={handleChange}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="프로필 이미지 수정"
            className={cn(
              'bg-container-neutral border-button-neutral absolute -right-[2px] bottom-[2px] flex size-6 cursor-pointer items-center justify-center rounded-full border transition-all duration-200',
              triggerClassName,
            )}
          >
            <Icon
              src={CameraIcon}
              size={triggerIconSize}
              className={cn('text-icon-normal', triggerIconClassName)}
              alt="프로필 이미지 수정"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="bottom">
          <DropdownMenuItem
            className="text-text-alternative"
            onSelect={() => fileInputRef.current?.click()}
          >
            이미지 업로드
          </DropdownMenuItem>
          {showResetAction && (
            <>
              <Divider className="w-[136px]" />
              <DropdownMenuItem className="text-text-alternative" onSelect={handleReset}>
                기본 이미지
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export { ProfileImageEditor, type ProfileImageEditorProps };
