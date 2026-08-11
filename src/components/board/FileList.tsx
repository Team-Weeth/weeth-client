'use client';

import DeleteIcon from '@/assets/icons/delete.svg';
import DownloadIcon from '@/assets/icons/download.svg';
import FolderIcon from '@/assets/icons/folder.svg';
import { Icon } from '@/components/ui/Icon';
import { stripUuidPrefix } from '@/lib/board';
import { cn } from '@/lib/cn';
import type { DisplayFile } from '@/types/board';

type FileListProps = {
  files: DisplayFile[];
} & (
  | { editable: true; onRemove: (id: string | number, fileUrl: string) => void }
  | { editable?: false; onRemove?: never }
);

function FileListItem({
  item,
  showDownload = true,
}: {
  item: DisplayFile;
  showDownload?: boolean;
}) {
  return (
    <>
      <div className="flex items-center gap-200">
        <Icon src={FolderIcon} size={20} className="text-icon-alternative" />
        <span className="text-text-normal typo-button2 min-w-0 truncate">{item.fileName}</span>
      </div>

      {showDownload && <Icon src={DownloadIcon} size={24} className="text-icon-normal" />}
    </>
  );
}

const rowStyles =
  'inline-flex items-center gap-400 rounded-sm border border-line bg-container-neutral px-200 py-200 transition-colors hover:bg-container-neutral-interaction';

function FileList({ files, editable, onRemove }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-col items-start gap-200">
      {files.map((item) =>
        editable ? (
          <div key={item.id} className={cn(rowStyles, item.uploaded === false && 'opacity-60')}>
            <Icon src={FolderIcon} size={20} className="text-icon-alternative shrink-0" />
            <span className="text-text-normal typo-button2 min-w-0 truncate">{item.fileName}</span>
            <button
              type="button"
              onClick={() => onRemove(item.id, item.fileUrl)}
              aria-label={`${item.fileName} 삭제`}
              className="text-state-error hover:text-state-error/80 flex shrink-0 items-center"
            >
              <Icon src={DeleteIcon} size={16} />
            </button>
          </div>
        ) : (
          <a
            key={item.id}
            href={item.fileUrl}
            download={stripUuidPrefix(item.fileName)}
            className={cn(
              rowStyles,
              'cursor-pointer',
              item.uploaded === false && 'pointer-events-none opacity-60',
            )}
            {...(item.uploaded === false && { tabIndex: -1, 'aria-disabled': true })}
          >
            <FileListItem item={item} />
          </a>
        ),
      )}
    </div>
  );
}

export { FileList, type FileListProps };
