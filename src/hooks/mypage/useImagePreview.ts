'use client';

import { useEffect, useRef, useState } from 'react';

interface UseImagePreviewOptions {
  initialImageUrl?: string;
  onFileChange?: (file: File) => void;
  onResetImage?: () => void;
}

function useImagePreview({ initialImageUrl, onFileChange, onResetImage }: UseImagePreviewOptions) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isReset, setIsReset] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

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

  const displayUrl = isReset ? null : (previewUrl ?? initialImageUrl ?? null);
  const isPreview = !!previewUrl && !isReset;

  return {
    fileInputRef,
    displayUrl,
    isPreview,
    handleChange,
    handleReset,
  };
}

export { useImagePreview, type UseImagePreviewOptions };
