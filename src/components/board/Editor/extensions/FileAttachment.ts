import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { FileAttachmentView } from './FileAttachmentView';

export const FileAttachment = Node.create({
  name: 'fileAttachment',

  group: 'block',

  atom: true,

  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      fileName: { default: '' },
      fileSize: { default: 0 },
      contentType: { default: 'application/octet-stream' },
      uploadId: {
        default: null,
        rendered: false,
      },
      uploading: {
        default: false,
        rendered: false,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-file-attachment]',
        getAttrs: (element) => ({
          src: (element as HTMLElement).getAttribute('data-src'),
          fileName: (element as HTMLElement).getAttribute('data-file-name'),
          fileSize: Number((element as HTMLElement).getAttribute('data-file-size') || 0),
          contentType:
            (element as HTMLElement).getAttribute('data-content-type') ||
            'application/octet-stream',
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes({
        'data-file-attachment': '',
        'data-src': HTMLAttributes.src,
        'data-file-name': HTMLAttributes.fileName,
        'data-file-size': String(HTMLAttributes.fileSize),
        'data-content-type': HTMLAttributes.contentType,
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileAttachmentView);
  },
});
