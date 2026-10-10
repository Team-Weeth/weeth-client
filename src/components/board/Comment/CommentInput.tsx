'use client';

import { useEffect, useRef, useState } from 'react';
import FolderPlusIcon from '@/assets/icons/folder_plus.svg';
import SendIcon from '@/assets/icons/send.svg';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Textarea } from '@/components/ui/Textarea';
import { FileList } from '@/components/board/FileList';
import { ImageList } from '@/components/board/ImageList/ImageList';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useCommentFileUpload } from '@/hooks/useCommentFileUpload';
import { cn } from '@/lib/cn';
import type { CreatePostFile, DisplayFile } from '@/types/file';

const BELOW_DESKTOP_MEDIA = '(max-width: 1031px)';

interface CommentInputProps {
  className?: string;
  placeholder?: string;
  defaultValue?: string;
  onSubmit?: (value: string, files: CreatePostFile[]) => Promise<boolean> | boolean;
  onCancel?: () => void;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  existingImageFiles?: DisplayFile[];
  existingNonImageFiles?: DisplayFile[];
  onRemoveExistingFile?: (id: string | number) => void;
}

function CommentInput({
  className,
  placeholder = '댓글을 입력하세요',
  defaultValue = '',
  onSubmit,
  onCancel,
  onValueChange,
  disabled = false,
  existingImageFiles,
  existingNonImageFiles,
  onRemoveExistingFile,
}: CommentInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const pendingActionRef = useRef<(() => void) | null>(null);
  const [value, setValue] = useState(defaultValue);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);

  const {
    fileInputRef,
    files: { imageFiles, nonImageFiles, handleRemoveFile },
    handlers: { handleInputChange },
    picker: { openFilePicker },
    clearFiles,
    getUploadedFiles,
  } = useCommentFileUpload();

  useEffect(() => {
    if (!attachMenuOpen) return;
    const mql = window.matchMedia(BELOW_DESKTOP_MEDIA);
    const handleChange = (e: MediaQueryListEvent) => {
      if (!e.matches) setAttachMenuOpen(false);
    };
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [attachMenuOpen]);

  const handleAttachClick = () => {
    if (window.matchMedia(BELOW_DESKTOP_MEDIA).matches) {
      setAttachMenuOpen(true);
    } else {
      openFilePicker();
    }
  };

  const handleChange = (newValue: string) => {
    setValue(newValue);
    onValueChange?.(newValue);
  };

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed || !onSubmit) return;
    const files = getUploadedFiles();
    try {
      const ok = await onSubmit(trimmed, files);
      if (ok !== false) {
        handleChange('');
        clearFiles();
      }
    } catch {
      // 실패 시 초안 유지
    }
  };

  return (
    <div className={cn('flex flex-col gap-200', className)}>
      {existingImageFiles && existingImageFiles.length > 0 && (
        <ImageList
          files={existingImageFiles}
          size="compact"
          removable
          onRemove={(id) => onRemoveExistingFile?.(id)}
        />
      )}
      {existingNonImageFiles && existingNonImageFiles.length > 0 && (
        <FileList
          files={existingNonImageFiles}
          editable
          onRemove={(id) => onRemoveExistingFile?.(id)}
        />
      )}
      {imageFiles.length > 0 && (
        <ImageList files={imageFiles} size="compact" removable onRemove={handleRemoveFile} />
      )}
      {nonImageFiles.length > 0 && (
        <FileList files={nonImageFiles} editable onRemove={handleRemoveFile} />
      )}

      <div className="bg-container-neutral-alternative flex items-start gap-[10px] rounded-lg p-[10px]">
        <input
          ref={fileInputRef}
          type="file"
          disabled={disabled}
          className="hidden"
          onChange={handleInputChange}
          aria-hidden="true"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          disabled={disabled}
          className="hidden"
          onChange={handleInputChange}
          aria-hidden="true"
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          disabled={disabled}
          className="hidden"
          onChange={handleInputChange}
          aria-hidden="true"
        />
        <Button
          type="button"
          variant="secondary"
          size="icon-md"
          disabled={disabled}
          className="shrink-0"
          onClick={handleAttachClick}
          aria-label="파일 첨부"
        >
          <Icon src={FolderPlusIcon} size={20} className="text-icon-normal" />
        </Button>
        <div className="min-w-0 flex-1">
          <Textarea
            ref={textareaRef}
            autoGrow
            clearable
            rows={1}
            maxLength={300}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            wrapperClassName="bg-container-neutral min-h-800 rounded-lg px-300 py-200"
          />
          <p className="typo-caption2 text-text-alternative mt-100 text-right">
            {value.length}/300
          </p>
        </div>

        {!onCancel && (
          <Button
            type="button"
            variant="secondary"
            size="icon-md"
            className="shrink-0"
            onClick={handleSubmit}
            disabled={disabled || !value.trim()}
            aria-label="댓글 전송"
          >
            <Icon
              src={SendIcon}
              size={20}
              className={disabled || !value.trim() ? 'text-icon-disabled' : 'text-icon-normal'}
            />
          </Button>
        )}
      </div>

      {onCancel && (
        <div className="flex justify-end gap-200 pr-200">
          <button
            type="button"
            className="typo-button2 text-text-alternative hover:text-text-normal active:text-text-strong cursor-pointer rounded-sm transition-colors"
            onClick={onCancel}
          >
            취소
          </button>
          <button
            type="button"
            className="typo-button2 text-brand-primary disabled:text-text-disabled cursor-pointer rounded-sm transition-colors hover:opacity-80 active:opacity-60 disabled:cursor-not-allowed disabled:opacity-100"
            onClick={handleSubmit}
            disabled={disabled || !value.trim()}
          >
            저장
          </button>
        </div>
      )}

      <Dialog open={attachMenuOpen} onOpenChange={setAttachMenuOpen}>
        <DialogContent
          className="flex flex-col gap-200"
          showCloseButton={false}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            pendingActionRef.current?.();
            pendingActionRef.current = null;
          }}
        >
          <DialogTitle className="sr-only">파일 첨부</DialogTitle>
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => {
                pendingActionRef.current = () => cameraInputRef.current?.click();
              }}
            >
              카메라
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => {
                pendingActionRef.current = () => galleryInputRef.current?.click();
              }}
            >
              사진 선택
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => {
                pendingActionRef.current = openFilePicker;
              }}
            >
              파일 선택
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { CommentInput, type CommentInputProps };
