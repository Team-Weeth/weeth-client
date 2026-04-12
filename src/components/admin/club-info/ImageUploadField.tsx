'use client';

import { useRef, useState } from 'react';

import Image from 'next/image';

import { AdminCloudUploadIcon } from '@/assets/icons/admin';
import { cn } from '@/lib/cn';

interface ImageUploadFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  title: string;
  description: string;
  aspectRatio?: '1/1' | 'auto';
  onFileSelect?: (file: File) => void;
}

function ImageUploadField({
  label,
  title,
  description,
  aspectRatio = 'auto',
  className,
  onFileSelect,
  ...props
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect?.(file);
    }
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
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect?.(file);
    }
  };

  return (
    <div className={cn('flex min-w-0 flex-col gap-400', className)} {...props}>
      <span className="typo-caption1 text-text-normal">{label}</span>
      <button
        type="button"
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'bg-container-neutral-alternative flex flex-1 flex-col items-center justify-center rounded-sm p-400',
          aspectRatio === '1/1' && 'aspect-square',
          isDragging
            ? 'border border-dashed border-brand-primary bg-container-neutral-interaction shadow-weeth'
            : 'border border-transparent',
        )}
      >
        <div className="flex flex-col items-center gap-300">
          <Image src={AdminCloudUploadIcon} alt="upload" width={32} height={32} />
          <div className="flex flex-col items-center gap-200">
            <span className="typo-sub1 text-text-normal">{title}</span>
            <span className="typo-caption2 text-text-alternative">{description}</span>
          </div>
        </div>
      </button>
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

export { ImageUploadField, type ImageUploadFieldProps };
