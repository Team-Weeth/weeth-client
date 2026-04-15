'use client';

import { useRef, useState } from 'react';

import Image from 'next/image';

import { AdminCloudUploadIcon } from '@/assets/icons/admin';
import { Button, Icon, ProgressBar } from '@/components/ui';
import { useImageDrop } from '@/hooks/useImageDrop';
import { useProgressAnimation } from '@/hooks/useProgressAnimation';
import type { OwnerType } from '@/lib/apis/file';
import { uploadFile } from '@/lib/apis/upload';
import { cn } from '@/lib/cn';
import { toastError } from '@/stores/useToastStore';

interface UploadResult {
  storageKey: string;
  fileUrl: string;
}

function UploadingContent({ onComplete, compact }: { onComplete: () => void; compact?: boolean }) {
  const progress = useProgressAnimation({ duration: 1500, onComplete });

  return (
    <div className="flex w-full flex-col items-center gap-300 px-400">
      <Image src={AdminCloudUploadIcon} alt="upload" width={32} height={32} />
      <span className="typo-sub1 text-text-strong">업로드 중...</span>
      <ProgressBar value={progress} className={cn('h-2 w-full', compact && 'max-w-32')} />
    </div>
  );
}

function IdleContent({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-300">
      <Image src={AdminCloudUploadIcon} alt="upload" width={36} height={36} />
      <div className="flex flex-col items-center gap-200">
        <span className="typo-sub1 text-text-normal">{title}</span>
        <span className="typo-caption2 text-text-alternative">{description}</span>
      </div>
    </div>
  );
}

function PreviewContent({
  previewUrl,
  aspectRatio,
  onReupload,
}: {
  previewUrl: string;
  aspectRatio: '1/1' | 'auto';
  onReupload: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        'relative flex w-full flex-1 overflow-hidden rounded-sm',
        aspectRatio === '1/1' && 'aspect-square',
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Image src={previewUrl} alt="preview" fill className="object-cover" unoptimized />
      {isHovered && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Button
            type="button"
            variant="secondary"
            size="md"
            className="typo-button1 gap-100 px-400 py-200"
            onClick={onReupload}
          >
            <Icon src={AdminCloudUploadIcon} alt="upload" size={16} className="text-icon-strong" />
            이미지 업로드
          </Button>
        </div>
      )}
    </div>
  );
}

interface ImageUploadFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  title: string;
  description: string;
  aspectRatio?: '1/1' | 'auto';
  ownerType: OwnerType;
  previewUrl?: string | null;
  onUploadComplete?: (result: UploadResult) => void;
  onReset?: () => void;
}

function useS3Upload(
  ownerType: OwnerType,
  onUploadComplete?: (result: UploadResult) => void,
  onReset?: () => void,
) {
  const [isUploading, setIsUploading] = useState(false);
  const uploadDoneRef = useRef(false);
  const animationDoneRef = useRef(false);

  const tryFinish = () => {
    if (uploadDoneRef.current && animationDoneRef.current) {
      setIsUploading(false);
      uploadDoneRef.current = false;
      animationDoneRef.current = false;
    }
  };

  const startUpload = async (file: File) => {
    uploadDoneRef.current = false;
    animationDoneRef.current = false;
    setIsUploading(true);

    try {
      const result = await uploadFile(file, ownerType);
      const objectUrl = URL.createObjectURL(file);
      onUploadComplete?.({ storageKey: result.storageKey, fileUrl: objectUrl });
      uploadDoneRef.current = true;
      tryFinish();
    } catch {
      toastError('이미지 업로드에 실패했습니다.');
      onReset?.();
      setIsUploading(false);
    }
  };

  const onAnimationComplete = () => {
    animationDoneRef.current = true;
    tryFinish();
  };

  return { isUploading, startUpload, onAnimationComplete };
}

function ImageUploadField({
  label,
  title,
  description,
  aspectRatio = 'auto',
  ownerType,
  previewUrl,
  className,
  onUploadComplete,
  onReset,
  ...props
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { isUploading, startUpload, onAnimationComplete } = useS3Upload(
    ownerType,
    onUploadComplete,
    onReset,
  );
  const { isDragging, dragHandlers } = useImageDrop({ onDrop: startUpload });

  const phase = isUploading ? 'uploading' : previewUrl ? 'preview' : 'idle';
  const isCompact = aspectRatio === '1/1';

  const openFileDialog = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) startUpload(file);
    e.target.value = '';
  };

  return (
    <div className={cn('flex min-w-0 flex-col gap-300', className)} {...props}>
      <span className="typo-caption1 text-text-normal">{label}</span>

      {phase === 'preview' && previewUrl ? (
        <PreviewContent
          previewUrl={previewUrl}
          aspectRatio={aspectRatio}
          onReupload={openFileDialog}
        />
      ) : (
        <button
          type="button"
          onClick={openFileDialog}
          {...dragHandlers}
          className={cn(
            'bg-container-neutral-alternative flex flex-1 cursor-pointer flex-col items-center justify-center rounded-sm p-400',
            isCompact && 'aspect-square',
            isDragging
              ? 'border-brand-primary bg-container-neutral-interaction shadow-weeth border border-dashed'
              : 'border border-transparent',
          )}
        >
          {phase === 'uploading' ? (
            <UploadingContent onComplete={onAnimationComplete} compact={isCompact} />
          ) : (
            <IdleContent title={title} description={description} />
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}

export { ImageUploadField, type ImageUploadFieldProps, type UploadResult };
