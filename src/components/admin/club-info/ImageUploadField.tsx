'use client';

import { useRef, useState } from 'react';

import Image from 'next/image';

import { AdminCloudUploadIcon } from '@/assets/icons/admin';
import { Button, ProgressBar } from '@/components/ui';
import { useProgressAnimation } from '@/hooks/useProgressAnimation';
import type { OwnerType } from '@/lib/apis/file';
import { uploadFile } from '@/lib/apis/upload';
import { cn } from '@/lib/cn';
import { toastError } from '@/stores/useToastStore';

type Phase = 'idle' | 'uploading' | 'preview';

interface UploadResult {
  storageKey: string;
  fileUrl: string;
}

function UploadingContent({ onComplete }: { onComplete: () => void }) {
  const progress = useProgressAnimation({ duration: 1500, onComplete });

  return (
    <div className="flex w-full flex-col items-center gap-300">
      <Image src={AdminCloudUploadIcon} alt="upload" width={32} height={32} />
      <span className="typo-sub1 text-text-strong">업로드 중...</span>
      <ProgressBar value={progress} className="h-2 w-1/2" />
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
          <Button type="button" variant="secondary" size="md" onClick={onReupload}>
            <Image
              src={AdminCloudUploadIcon}
              alt="upload"
              width={16}
              height={16}
              className="mr-200"
            />
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
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const uploadDoneRef = useRef(false);
  const animationDoneRef = useRef(false);

  const phase: Phase = isUploading ? 'uploading' : previewUrl ? 'preview' : 'idle';

  const tryFinishUpload = () => {
    if (uploadDoneRef.current && animationDoneRef.current) {
      setIsUploading(false);
      uploadDoneRef.current = false;
      animationDoneRef.current = false;
    }
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const handleFileSelected = async (selectedFile: File) => {
    uploadDoneRef.current = false;
    animationDoneRef.current = false;
    setIsUploading(true);

    try {
      const result = await uploadFile(selectedFile, ownerType);
      const objectUrl = URL.createObjectURL(selectedFile);
      onUploadComplete?.({ storageKey: result.storageKey, fileUrl: objectUrl });
      uploadDoneRef.current = true;
      tryFinishUpload();
    } catch {
      toastError('이미지 업로드에 실패했습니다.');
      onReset?.();
      setIsUploading(false);
    }
  };

  const handleAnimationComplete = () => {
    animationDoneRef.current = true;
    tryFinishUpload();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelected(selectedFile);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      handleFileSelected(droppedFile);
    }
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
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'bg-container-neutral-alternative flex flex-1 cursor-pointer flex-col items-center justify-center rounded-sm p-400',
            aspectRatio === '1/1' && 'aspect-square',
            isDragging
              ? 'border-brand-primary bg-container-neutral-interaction shadow-weeth border border-dashed'
              : 'border border-transparent',
          )}
        >
          {phase === 'uploading' ? (
            <UploadingContent onComplete={handleAnimationComplete} />
          ) : (
            <div className="flex flex-col items-center gap-300">
              <Image src={AdminCloudUploadIcon} alt="upload" width={32} height={32} />
              <div className="flex flex-col items-center gap-200">
                <span className="typo-sub1 text-text-normal">{title}</span>
                <span className="typo-caption2 text-text-alternative">{description}</span>
              </div>
            </div>
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
