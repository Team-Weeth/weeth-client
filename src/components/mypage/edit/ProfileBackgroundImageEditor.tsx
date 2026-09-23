'use client';

import Image from 'next/image';
import CameraIcon from '@/assets/icons/camera.svg';
import { Divider } from '@/components/ui/Divider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { Icon } from '@/components/ui/Icon';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { useImagePreview } from '@/hooks/mypage';
import { cn } from '@/lib/cn';

interface ProfileBackgroundImageEditorProps {
  backgroundImageUrl?: string;
  onFileChange?: (file: File) => void;
  onResetImage?: () => void;
  isLoading?: boolean;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  triggerClassName?: string;
  triggerIconClassName?: string;
  triggerIconSize?: number;
  showResetAction?: boolean;
}

function ProfileBackgroundImageEditor({
  backgroundImageUrl,
  onFileChange,
  onResetImage,
  isLoading = false,
  priority = false,
  className,
  imageClassName,
  triggerClassName,
  triggerIconClassName,
  triggerIconSize = 16,
  showResetAction = true,
}: ProfileBackgroundImageEditorProps) {
  const { fileInputRef, displayUrl, isPreview, handleChange, handleReset } = useImagePreview({
    initialImageUrl: backgroundImageUrl,
    onFileChange,
    onResetImage,
  });

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-t-[12px]',
        displayUrl ? 'bg-transparent' : 'bg-brand-primary',
        className,
      )}
    >
      {displayUrl && (
        <Image
          src={displayUrl}
          alt=""
          fill
          priority={priority}
          unoptimized={isPreview}
          className={cn('absolute inset-0 object-cover', imageClassName)}
        />
      )}
      {isLoading && (
        <LoadingOverlay label="배경 이미지 업로드 중" className="z-10" spinnerClassName="size-6" />
      )}
      <div className="relative h-[130px] w-full">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          aria-label="배너 이미지 선택"
          onChange={handleChange}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="배너 변경"
              disabled={isLoading}
              className={cn(
                'bg-container-neutral border-button-neutral absolute top-3 right-3 flex size-6 cursor-pointer items-center justify-center rounded-full border disabled:cursor-not-allowed disabled:opacity-50',
                triggerClassName,
              )}
            >
              <Icon
                src={CameraIcon}
                size={triggerIconSize}
                className={cn('text-icon-normal', triggerIconClassName)}
                alt="배너 변경"
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
    </div>
  );
}

export { ProfileBackgroundImageEditor, type ProfileBackgroundImageEditorProps };
