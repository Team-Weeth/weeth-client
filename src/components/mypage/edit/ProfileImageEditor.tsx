'use client';

import { useRef, useState } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Icon,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Divider,
} from '@/components/ui';
import { EditIcon } from '@/assets/icons';

interface ProfileImageEditorProps {
  name: string;
  profileImageUrl?: string;
  onFileChange?: (file: File) => void;
  onResetImage?: () => void;
}

function ProfileImageEditor({
  name,
  profileImageUrl,
  onFileChange,
  onResetImage,
}: ProfileImageEditorProps) {
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

  const displayUrl = isReset ? null : (previewUrl ?? profileImageUrl ?? null);

  return (
    <div className="relative inline-block">
      <Avatar size={128} type="round">
        <AvatarImage
          key={displayUrl ?? 'fallback'}
          src={displayUrl ?? undefined}
          alt={name}
          className="object-cover"
        />
        <AvatarFallback />
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
            className="bg-button-neutral hover:bg-button-neutral-interaction absolute right-0 bottom-0 flex size-[40px] cursor-pointer items-center justify-center rounded-sm transition-all duration-200"
          >
            <Icon src={EditIcon} size={24} className="text-icon-normal" alt="편집 아이콘" />
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
  );
}

export { ProfileImageEditor, type ProfileImageEditorProps };
