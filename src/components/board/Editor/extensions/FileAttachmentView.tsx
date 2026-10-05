'use client';

import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { TextSelection } from '@tiptap/pm/state';
import { cn } from '@/lib/cn';
import { stripUuidPrefix } from '@/lib/board';
import FolderIcon from '@/assets/icons/folder.svg';
import DownloadIcon from '@/assets/icons/download.svg';
import DeleteIcon from '@/assets/icons/delete.svg';
import { Icon } from '@/components/ui/Icon';
import { GapZone } from './GapZone';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileAttachmentView({ node, deleteNode, editor, getPos }: NodeViewProps) {
  const { src, fileName, fileSize, uploading } = node.attrs;
  const isEditable = editor.isEditable;

  let nodeBefore: ReturnType<typeof editor.state.doc.resolve>['nodeBefore'] = null;
  let nodeAfter: ReturnType<typeof editor.state.doc.resolve>['nodeAfter'] = null;
  try {
    const pos = getPos();
    nodeBefore = editor.state.doc.resolve(pos).nodeBefore;
    const afterPos = pos + node.nodeSize;
    if (afterPos <= editor.state.doc.content.size) {
      nodeAfter = editor.state.doc.resolve(afterPos).nodeAfter;
    }
  } catch {
    // Position stale during mid-update re-render — skip GapZone logic
  }

  const handleInsertBefore = () => {
    if (nodeBefore?.isTextblock) return;
    const p = getPos();
    const { state } = editor;
    const paragraph = state.schema.nodes.paragraph.create();
    const tr = state.tr.insert(p, paragraph);
    tr.setSelection(TextSelection.near(tr.doc.resolve(p + 1)));
    editor.view.dispatch(tr);
    editor.view.focus();
  };

  const handleInsertAfter = () => {
    if (nodeAfter?.isTextblock) return;
    const p = getPos();
    const insertAt = p + node.nodeSize;
    const { state } = editor;
    const paragraph = state.schema.nodes.paragraph.create();
    const tr = state.tr.insert(insertAt, paragraph);
    tr.setSelection(TextSelection.near(tr.doc.resolve(insertAt + 1)));
    editor.view.dispatch(tr);
    editor.view.focus();
  };

  const content = (
    <div
      className={cn(
        'border-line bg-container-neutral hover:bg-container-neutral-interaction inline-flex items-center gap-400 rounded-sm border px-200 py-200 transition-colors',
        isEditable && 'cursor-grab',
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
    <NodeViewWrapper className="w-full">
      {!nodeBefore?.isTextblock && (
        <GapZone isEditable={isEditable} onInsert={handleInsertBefore} />
      )}

      <div className="my-200">
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
      </div>

      {!nodeAfter?.isTextblock && <GapZone isEditable={isEditable} onInsert={handleInsertAfter} />}
    </NodeViewWrapper>
  );
}

export { FileAttachmentView };
