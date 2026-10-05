import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ImageGroupView } from './ImageGroupView';

export const MAX_GROUP_IMAGES = 3;

export interface GroupImage {
  src: string;
  alt: string | null;
  width: number | null;
  uploadId: string | null;
  uploading: boolean;
}

export const ImageGroup = Node.create({
  name: 'imageGroup',

  group: 'block',

  atom: true,

  draggable: true,

  addAttributes() {
    return {
      images: {
        default: [],
        parseHTML: (element) => {
          const figures = element.querySelectorAll('figure');
          const images: GroupImage[] = [];
          figures.forEach((figure) => {
            const img = figure.querySelector('img');
            if (img) {
              images.push({
                src: img.getAttribute('src') ?? '',
                alt: img.getAttribute('alt') ?? null,
                width: img.getAttribute('width') ? Number(img.getAttribute('width')) : null,
                uploadId: null,
                uploading: false,
              });
            }
          });
          return images;
        },
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-image-group]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const images = (node.attrs.images ?? []) as GroupImage[];
    const children = images.map((image) => {
      const imgAttrs: Record<string, string> = {};
      if (image.src) imgAttrs.src = image.src;
      if (image.alt) imgAttrs.alt = image.alt;
      if (image.width) imgAttrs.width = String(image.width);
      return ['figure', {}, ['img', imgAttrs]] as const;
    });

    return ['div', mergeAttributes({ 'data-image-group': '' }), ...children];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageGroupView);
  },
});
