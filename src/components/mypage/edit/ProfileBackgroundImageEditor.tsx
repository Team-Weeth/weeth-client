'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { CameraIcon } from '@/assets/icons';
import {
  Divider,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
} from '@/components/ui';
import { cn } from '@/lib/cn';

interface ProfileBackgroundImageEditorProps {
  backgroundImageUrl?: string;
  onFileChange?: (file: File) => void;
  onResetImage?: () => void;
  className?: string;
  imageClassName?: string;
  triggerClassName?: string;
  triggerIconClassName?: string;
  triggerIconSize?: number;
}

function ProfileBackgroundImageEditor({
  backgroundImageUrl,
  onFileChange,
  onResetImage,
  className,
  imageClassName,
  triggerClassName,
  triggerIconClassName,
  triggerIconSize = 16,
}: ProfileBackgroundImageEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isReset, setIsReset] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setPreviewUrl(url);
    setIsReset(false);
    onFileChange?.(file);
  };

  const handleReset = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);
    setIsReset(true);
    onResetImage?.();
  };

  const displayUrl = isReset ? null : (previewUrl ?? backgroundImageUrl ?? null);

  return (
    <div className={cn('bg-brand-primary relative overflow-hidden rounded-t-[12px]', className)}>
      {displayUrl && (
        <Image
          src={displayUrl}
          alt=""
          fill
          unoptimized
          className={cn('absolute inset-0 object-cover', imageClassName)}
        />
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
              className={cn(
                'bg-container-neutral border-button-neutral absolute top-3 right-3 flex size-6 cursor-pointer items-center justify-center rounded-full border',
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
            <Divider className="w-[136px]" />
            <DropdownMenuItem className="text-text-alternative" onSelect={handleReset}>
              기본 이미지
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export { ProfileBackgroundImageEditor, type ProfileBackgroundImageEditorProps };
