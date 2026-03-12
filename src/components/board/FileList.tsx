'use client';

import type { StaticImageData } from 'next/image';
import { DownloadIcon, FolderIcon } from '@/assets/icons';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { FileItem } from '@/stores/usePostStore';

type FileListProps = {
  files: FileItem[];
} & (
  | { editable: true; onRemove: (id: string, fileUrl: string) => void }
  | { editable?: false; onRemove?: never }
);

function FileListItem({ item }: { item: FileItem }) {
  return (
    <>
      <div className="flex items-center gap-200">
        <span
          aria-hidden="true"
          className="bg-icon-alternative block h-4 w-5 shrink-0 mask-contain mask-center mask-no-repeat"
          style={{
            maskImage: `url(${(FolderIcon as StaticImageData).src})`,
            WebkitMaskImage: `url(${(FolderIcon as StaticImageData).src})`,
          }}
        />
        <span className="text-text-normal typo-button2 min-w-0 truncate">{item.fileName}</span>
      </div>

      <span
        aria-hidden="true"
        className="bg-icon-normal block h-6 w-6 shrink-0"
        style={{
          maskImage: `url(${(DownloadIcon as StaticImageData).src})`,
          WebkitMaskImage: `url(${(DownloadIcon as StaticImageData).src})`,
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          maskSize: 'contain',
        }}
      />
    </>
  );
}

const rowStyles =
  'inline-flex items-center gap-400 rounded-sm border border-line bg-white/5 px-200 py-200 transition-colors hover:bg-container-neutral-interaction';

function FileList({ files, editable, onRemove }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-col items-start gap-200">
      {files.map((item) =>
        editable ? (
          <div key={item.id} className={cn(rowStyles, !item.uploaded && 'opacity-60')}>
            <FileListItem item={item} />
            <button
              type="button"
              onClick={() => onRemove(item.id, item.fileUrl)}
              aria-label={`${item.fileName} 삭제`}
              className="text-state-error hover:text-state-error/80 shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <a
            key={item.id}
            href={item.fileUrl}
            download={item.fileName}
            className={cn(
              rowStyles,
              'cursor-pointer',
              !item.uploaded && 'pointer-events-none opacity-60',
            )}
            {...(!item.uploaded && { tabIndex: -1, 'aria-disabled': true })}
          >
            <FileListItem item={item} />
          </a>
        ),
      )}
    </div>
  );
}

export { FileList, type FileListProps };
