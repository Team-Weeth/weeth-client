'use client';

import { useRef, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage, Icon } from '@/components/ui';
import { EditIcon } from '@/assets/icons';

interface ProfileImageEditorProps {
  name: string;
  profileImageUrl?: string;
  onFileChange?: (file: File) => void;
}

function ProfileImageEditor({ name, profileImageUrl, onFileChange }: ProfileImageEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setPreviewUrl(url);
    onFileChange?.(file);
  };

  const displayUrl = previewUrl ?? profileImageUrl;

  return (
    <div className="relative inline-block">
      <Avatar size={128} type="round">
        {displayUrl && <AvatarImage src={displayUrl} alt={name} />}
        <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
      </Avatar>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-label="프로필 이미지 선택"
        onChange={handleChange}
      />
      <button
        type="button"
        aria-label="프로필 이미지 수정"
        onClick={() => fileInputRef.current?.click()}
        className="bg-button-neutral hover:bg-button-neutral-interaction absolute right-0 bottom-0 flex size-[40px] cursor-pointer items-center justify-center rounded-sm transition-all duration-200 hover:scale-110"
      >
        <Icon src={EditIcon} size={24} className="text-icon-normal" alt="편집 아이콘" />
      </button>
    </div>
  );
}

export { ProfileImageEditor, type ProfileImageEditorProps };
