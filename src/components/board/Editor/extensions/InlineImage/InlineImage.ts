import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { InlineImageView } from './InlineImageView';

export const InlineImage = Node.create({
  name: 'inlineImage',

  group: 'block',

  atom: true,

  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      textAlign: {
        default: 'left',
        parseHTML: (element) => {
          if (element.tagName === 'FIGURE') {
            return element.style.textAlign || 'left';
          }
          return element.getAttribute('data-text-align') || 'left';
        },
        renderHTML: () => ({}),
      },
      width: {
        default: null,
        parseHTML: (element) => {
          const img = element.tagName === 'IMG' ? element : element.querySelector('img');
          const raw = img?.getAttribute('width');
          return raw ? Number(raw) : null;
        },
        renderHTML: () => ({}),
      },
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
        tag: 'figure',
        getAttrs: (element) => {
          const img = (element as HTMLElement).querySelector('img');
          if (!img) return false;
          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
          };
        },
      },
      {
        tag: 'img[src]',
        getAttrs: (element) => ({
          src: (element as HTMLElement).getAttribute('src'),
          alt: (element as HTMLElement).getAttribute('alt'),
          title: (element as HTMLElement).getAttribute('title'),
        }),
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const { src, alt, title } = HTMLAttributes;
    const { width, textAlign } = node.attrs;
    const imgAttrs: Record<string, string> = {};
    if (src) imgAttrs.src = src;
    if (alt) imgAttrs.alt = alt;
    if (title) imgAttrs.title = title;
    if (width) imgAttrs.width = String(width);

    return [
      'figure',
      mergeAttributes({ style: `text-align: ${textAlign || 'left'}` }),
      ['img', imgAttrs],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(InlineImageView);
  },
});
