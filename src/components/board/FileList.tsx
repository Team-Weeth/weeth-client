'use client';

import type { StaticImageData } from 'next/image';
import { DownloadIcon, FolderIcon } from '@/assets/icons';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { FileItem } from '@/stores/usePostStore';

type FileListProps = {
  files: FileItem[];
} & (
  | { removable: true; onRemove: (id: string, fileUrl: string) => void }
  | { removable?: false; onRemove?: never }
);

function FileList({ files, removable, onRemove }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-col items-start gap-200">
      {files.map((item) => (
        <div
          key={item.id}
          className={cn(
            'inline-flex items-center gap-400 rounded-sm border border-line bg-white/5 px-200 py-200',
            !item.uploaded && 'opacity-60',
          )}
        >
          {/* FolderIcon + 파일명 */}
          <div className="flex items-center gap-200">
            <span
              aria-hidden="true"
              className="bg-icon-alternative block h-4 w-5 shrink-0 mask-contain mask-center mask-no-repeat"
              style={{
                maskImage: `url(${(FolderIcon as StaticImageData).src})`,
                WebkitMaskImage: `url(${(FolderIcon as StaticImageData).src})`,
              }}
            />
            <a
              href={item.fileUrl}
              download={item.fileName}
              className={cn(
                'text-text-normal typo-button2 min-w-0 truncate hover:underline',
                !item.uploaded && 'pointer-events-none',
              )}
              {...(!item.uploaded && { tabIndex: -1, 'aria-disabled': true })}
            >
              {item.fileName}
            </a>
          </div>

          {/* DownloadIcon + 삭제 버튼 */}
          <div className="flex items-center gap-100">
            <a
              href={item.fileUrl}
              download={item.fileName}
              aria-label={`${item.fileName} 다운로드`}
              className={cn('shrink-0', !item.uploaded && 'pointer-events-none')}
              {...(!item.uploaded && { tabIndex: -1, 'aria-disabled': true })}
            >
              <span
                aria-hidden="true"
                className="bg-icon-normal block h-6 w-6"
                style={{
                  maskImage: `url(${(DownloadIcon as StaticImageData).src})`,
                  WebkitMaskImage: `url(${(DownloadIcon as StaticImageData).src})`,
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  maskSize: 'contain',
                }}
              />
            </a>
            {removable && (
              <button
                type="button"
                onClick={() => onRemove(item.id, item.fileUrl)}
                aria-label={`${item.fileName} 삭제`}
                className="text-icon-alternative hover:text-icon-normal shrink-0"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export { FileList, type FileListProps };
