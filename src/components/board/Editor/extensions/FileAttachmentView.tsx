'use client';

import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { cn } from '@/lib/cn';
import { stripUuidPrefix } from '@/lib/board';
import FolderIcon from '@/assets/icons/folder.svg';
import DownloadIcon from '@/assets/icons/download.svg';
import DeleteIcon from '@/assets/icons/delete.svg';
import { Icon } from '@/components/ui/Icon';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileAttachmentView({ node, deleteNode, editor }: NodeViewProps) {
  const { src, fileName, fileSize, uploading } = node.attrs;
  const isEditable = editor.isEditable;

  const content = (
    <div
      className={cn(
        'border-line inline-flex items-center gap-400 rounded-sm border px-200 py-200 transition-colors',
        isEditable
          ? 'bg-container-neutral'
          : 'bg-container-neutral hover:bg-container-neutral-interaction',
        uploading && 'opacity-60',
      )}
      data-drag-handle
    >
      <div className="flex items-center gap-200">
        <Icon src={FolderIcon} size={20} className="text-icon-alternative shrink-0" />
        <span className="text-text-normal typo-button2 min-w-0 truncate">
          {stripUuidPrefix(fileName)}
        </span>
        <span className="text-text-alternative typo-caption2 shrink-0">
          {formatFileSize(fileSize)}
        </span>
      </div>

      {isEditable ? (
        <button
          type="button"
          onClick={deleteNode}
          aria-label={`${fileName} 삭제`}
          className="text-state-error hover:text-state-error/80 flex shrink-0 cursor-pointer items-center"
        >
          <Icon src={DeleteIcon} size={16} />
        </button>
      ) : (
        !uploading && <Icon src={DownloadIcon} size={24} className="text-icon-normal" />
      )}
    </div>
  );

  return (
    <NodeViewWrapper className="my-200">
      {isEditable || uploading ? (
        content
      ) : (
        <a
          href={src}
          download={stripUuidPrefix(fileName)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex"
        >
          {content}
        </a>
      )}
    </NodeViewWrapper>
  );
}

export { FileAttachmentView };
