import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { Node as PmNode } from '@tiptap/pm/model';
import { usePostStore } from '@/stores/usePostStore';

function collectUploadIds(doc: PmNode): Set<string> {
  const ids = new Set<string>();
  doc.descendants((node) => {
    if (node.type.name === 'inlineImage' || node.type.name === 'fileAttachment') {
      if (node.attrs.uploadId) ids.add(node.attrs.uploadId as string);
    } else if (node.type.name === 'imageGroup') {
      const images = node.attrs.images as Array<{ uploadId?: string | null }>;
      for (const img of images) {
        if (img.uploadId) ids.add(img.uploadId);
      }
    }
  });
  return ids;
}

/**
 * 에디터 문서에서 이미지/파일 노드가 제거될 때 usePostStore.files도 동기화한다.
 * 삭제 경로(UI 버튼, 키보드, undo 등)에 관계없이 모든 케이스를 처리한다.
 */
const FileStoreSync = Extension.create({
  name: 'fileStoreSync',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('fileStoreSync'),
        view() {
          return {
            update(view, prevState) {
              if (prevState.doc.eq(view.state.doc)) return;

              const oldIds = collectUploadIds(prevState.doc);
              if (oldIds.size === 0) return;

              const newIds = collectUploadIds(view.state.doc);
              const { removeFile } = usePostStore.getState();

              for (const id of oldIds) {
                if (!newIds.has(id)) {
                  removeFile(id);
                }
              }
            },
          };
        },
      }),
    ];
  },
});

export { FileStoreSync };
