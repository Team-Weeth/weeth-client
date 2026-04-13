'use client';

import { useRef, useState } from 'react';
import { FolderPlusIcon, SendIcon } from '@/assets/icons';
import { FileList } from '@/components/board/FileList';
import { Button, Icon, Textarea } from '@/components/ui';
import { useFileAttach } from '@/hooks';
import { cn } from '@/lib/cn';
import type { DisplayFile } from '@/types/board';
import type { UploadFileItem } from '@/stores/usePostStore';

interface CommentInputProps {
  className?: string;
  placeholder?: string;
  defaultValue?: string;
  defaultFiles?: DisplayFile[];
  onSubmit?: (value: string, file: UploadFileItem | null, existingFilesRemoved: boolean) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

function CommentInput({
  className,
  placeholder = '댓글을 입력하세요',
  defaultValue = '',
  defaultFiles = [],
  onSubmit,
  onCancel,
  disabled = false,
}: CommentInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [existingFiles, setExistingFiles] = useState<DisplayFile[]>(defaultFiles);
  const { inputRef, file, open, handleChange, remove, reset, upload } = useFileAttach();

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed) return;

    let uploadedFile: UploadFileItem | null = null;
    if (file) {
      const storageKey = await upload('COMMENT');
      if (!storageKey) return;
      uploadedFile = { ...file, storageKey, uploaded: true };
    }

    const filesRemoved = defaultFiles.length > 0 && existingFiles.length === 0;
    onSubmit?.(trimmed, uploadedFile, filesRemoved);
    setValue('');
    reset();
  };

  return (
    <div className={cn('flex flex-col gap-200', className)}>
      <input ref={inputRef} type="file" className="hidden" onChange={handleChange} />

      <div className="bg-container-neutral-alternative flex items-start gap-300 rounded-lg p-300">
        <Button
          type="button"
          variant="secondary"
          size="icon-md"
          className="shrink-0"
          onClick={open}
          disabled={disabled}
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
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            wrapperClassName="min-h-800 rounded-lg px-400 py-200"
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

      {existingFiles.length > 0 && (
        <FileList
          files={existingFiles}
          editable
          onRemove={(id) => setExistingFiles((prev) => prev.filter((f) => f.id !== id))}
        />
      )}

      {file && <FileList files={[{ ...file, uploaded: true }]} editable onRemove={remove} />}

      {onCancel && (
        <div className="flex justify-end gap-200 pr-200">
          <button type="button" className="typo-button2 text-text-alternative" onClick={onCancel}>
            취소
          </button>
          <button
            type="button"
            className="typo-button2 text-brand-primary disabled:text-text-disabled"
            onClick={handleSubmit}
            disabled={disabled || !value.trim()}
          >
            저장
          </button>
        </div>
      )}
    </div>
  );
}

export { CommentInput, type CommentInputProps };
