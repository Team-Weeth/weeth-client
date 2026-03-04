import Image from 'next/image';
import type { StaticImageData } from 'next/image';
import downloadIcon from '@/assets/icons/download.svg';
import folderIcon from '@/assets/icons/folder.svg';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { FileItem } from '@/stores/usePostStore';

type FileListProps = {
  files: FileItem[];
} & (
  | { removable: true; onRemove: (id: string, fileUrl: string) => void }
  | { removable?: false; onRemove?: never }
);

export function FileList({ files, removable, onRemove }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-col items-start gap-200">
      {files.map((item) => (
        <div
          key={item.id}
          className={cn(
            'border-line bg-container-neutral-alternative inline-flex items-center gap-400 rounded-sm border px-200 py-200',
            !item.uploaded && 'opacity-60',
          )}
        >
          {/* FolderIcon + 파일명 */}
          <div className="flex items-center gap-200">
            <Image
              src={folderIcon}
              alt=""
              width={20}
              height={16}
              className="shrink-0"
              aria-hidden="true"
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
                  maskImage: `url(${(downloadIcon as StaticImageData).src})`,
                  WebkitMaskImage: `url(${(downloadIcon as StaticImageData).src})`,
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
