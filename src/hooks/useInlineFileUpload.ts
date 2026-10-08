import { useState, useRef, useEffect, useCallback } from 'react';
import type { Editor } from '@tiptap/core';
import { useShallow } from 'zustand/react/shallow';
import type { OwnerType } from '@/lib/apis/file';
import { isImageFileName } from '@/lib/board/fileUtils';
import { useFileUploadCore, type CoreFileItem } from '@/hooks/useFileUploadCore';
import { usePostStore } from '@/stores/usePostStore';
import { MAX_GROUP_IMAGES } from '@/components/board/Editor/extensions/ImageGroup/ImageGroup';

function updateNodeByUploadId(editor: Editor, uploadId: string, attrs: Record<string, unknown>) {
  editor.state.doc.descendants((node, pos) => {
    // Direct node match (inlineImage, fileAttachment)
    if (node.attrs.uploadId === uploadId) {
      editor.view.dispatch(
        editor.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...attrs }),
      );
      return false;
    }

    // imageGroup: search inside images array
    if (node.type.name === 'imageGroup') {
      const images = node.attrs.images as Array<{
        uploadId: string | null;
        [key: string]: unknown;
      }>;
      const idx = images.findIndex((img) => img.uploadId === uploadId);
      if (idx !== -1) {
        const newImages = images.map((img, i) => (i === idx ? { ...img, ...attrs } : img));
        editor.view.dispatch(
          editor.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, images: newImages }),
        );
        return false;
      }
    }
  });
}

function removeNodeByUploadId(editor: Editor, uploadId: string) {
  editor.state.doc.descendants((node, pos) => {
    // Direct node match
    if (node.attrs.uploadId === uploadId) {
      editor.view.dispatch(editor.state.tr.delete(pos, pos + node.nodeSize));
      return false;
    }

    // imageGroup: remove from images array
    if (node.type.name === 'imageGroup') {
      const images = node.attrs.images as Array<{
        uploadId: string | null;
        [key: string]: unknown;
      }>;
      const idx = images.findIndex((img) => img.uploadId === uploadId);
      if (idx !== -1) {
        const newImages = images.filter((_, i) => i !== idx);
        if (newImages.length === 0) {
          editor.view.dispatch(editor.state.tr.delete(pos, pos + node.nodeSize));
        } else if (newImages.length === 1) {
          const img = newImages[0];
          const inlineImageNode = editor.state.schema.nodes.inlineImage.create({
            src: img.src,
            alt: img.alt ?? null,
            width: img.width ?? null,
            uploadId: img.uploadId,
            uploading: img.uploading ?? false,
          });
          editor.view.dispatch(
            editor.state.tr.replaceWith(pos, pos + node.nodeSize, inlineImageNode),
          );
        } else {
          editor.view.dispatch(
            editor.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, images: newImages }),
          );
        }
        return false;
      }
    }
  });
}

export function useInlineFileUpload(ownerType: OwnerType = 'POST') {
  const { addFiles, markUploaded, removeFile } = usePostStore(
    useShallow((s) => ({
      addFiles: s.addFiles,
      markUploaded: s.markUploaded,
      removeFile: s.removeFile,
    })),
  );

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<Editor | null>(null);

  // 이미지 삽입 방식 선택 다이얼로그: null이면 닫힘, 배열이면 열림
  const [pendingImageItems, setPendingImageItems] = useState<CoreFileItem[] | null>(null);

  /** Call this to connect the editor instance after it's created */
  const setEditor = useCallback((editor: Editor | null) => {
    editorRef.current = editor;
  }, []);

  // Intercept addFiles to also insert nodes into the editor
  const addFilesAndInsertNodes = useCallback(
    (newFiles: CoreFileItem[]) => {
      addFiles(newFiles);

      const currentEditor = editorRef.current;
      if (!currentEditor) return;

      const imageItems = newFiles.filter((item) => isImageFileName(item.fileName));
      const nonImageItems = newFiles.filter((item) => !isImageFileName(item.fileName));

      // 블록 atom 노드를 개별 insertContent로 체이닝하면 NodeSelection이 이전 노드를
      // 덮어씌우므로, 한 번에 배열로 삽입
      if (nonImageItems.length > 0) {
        currentEditor
          .chain()
          .focus()
          .insertContent(
            nonImageItems.map((item) => ({
              type: 'fileAttachment' as const,
              attrs: {
                src: item.fileUrl,
                fileName: item.fileName,
                fileSize: item.fileSize,
                contentType: item.contentType,
                uploadId: item.id,
                uploading: true,
              },
            })),
          )
          .run();
      }

      if (imageItems.length === 0) return;

      if (imageItems.length === 1) {
        currentEditor
          .chain()
          .focus()
          .insertContent([
            {
              type: 'inlineImage' as const,
              attrs: { src: imageItems[0].fileUrl, uploadId: imageItems[0].id, uploading: true },
            },
          ])
          .run();
        return;
      }

      // 이미지 2장 이상: 삽입 방식 선택 다이얼로그 표시
      setPendingImageItems(imageItems);
    },
    [addFiles],
  );

  const removeFileAndNode = useCallback(
    (id: string) => {
      removeFile(id);
      if (editorRef.current) removeNodeByUploadId(editorRef.current, id);
    },
    [removeFile],
  );

  /**
   * 다이얼로그에서 삽입 방식을 선택했을 때 호출.
   * 업로드가 다이얼로그 표시 중에 완료됐을 수 있으므로 store에서 최신 상태를 읽어 노드를 생성한다.
   * 업로드가 실패해 store에서 제거된 항목은 삽입에서 제외한다.
   */
  const confirmImageInsertMode = (mode: 'individual' | 'group') => {
    if (!pendingImageItems) return;
    const currentEditor = editorRef.current;
    if (!currentEditor) return;

    const storeFiles = usePostStore.getState().files;
    // 업로드 실패로 store에서 제거된 항목은 건너뜀
    const activeItems = pendingImageItems.filter((item) =>
      storeFiles.some((f) => f.id === item.id),
    );

    if (activeItems.length === 0) {
      setPendingImageItems(null);
      return;
    }

    const getAttrs = (item: CoreFileItem) => {
      const current = storeFiles.find((f) => f.id === item.id);
      return {
        src: current?.fileUrl ?? item.fileUrl,
        uploadId: item.id,
        uploading: current ? !current.uploaded : true,
      };
    };

    if (mode === 'individual') {
      currentEditor
        .chain()
        .focus()
        .insertContent(
          activeItems.map((item) => ({
            type: 'inlineImage' as const,
            attrs: getAttrs(item),
          })),
        )
        .run();
    } else {
      // MAX_GROUP_IMAGES(3)장씩 묶어 imageGroup 삽입.
      const chunks: CoreFileItem[][] = [];
      for (let i = 0; i < activeItems.length; i += MAX_GROUP_IMAGES) {
        chunks.push(activeItems.slice(i, i + MAX_GROUP_IMAGES));
      }

      // 마지막 청크가 1장이면 이전 청크에서 1장을 가져와 2장으로 만든다.
      // e.g. 4장 → [[1,2,3],[4]] → [[1,2],[3,4]]
      if (chunks.length > 1 && chunks[chunks.length - 1].length === 1) {
        const last = chunks[chunks.length - 1];
        const prev = chunks[chunks.length - 2];
        last.unshift(prev.pop()!);
      }

      currentEditor
        .chain()
        .focus()
        .insertContent(
          chunks.flatMap((chunk): Array<{ type: string; attrs: Record<string, unknown> }> => {
            if (chunk.length === 1) {
              // activeItems가 1장일 때만 도달 (단일 청크)
              return [{ type: 'inlineImage', attrs: getAttrs(chunk[0]) }];
            }
            return [
              {
                type: 'imageGroup',
                attrs: {
                  images: chunk.map((item) => {
                    const { src, uploadId, uploading } = getAttrs(item);
                    return { src, alt: null, width: null, uploadId, uploading };
                  }),
                },
              },
            ];
          }),
        )
        .run();
    }

    setPendingImageItems(null);
  };

  /** 다이얼로그를 취소했을 때 호출 — 업로드 추적 중인 파일을 store에서 제거한다. */
  const cancelImageInsertMode = () => {
    if (!pendingImageItems) return;
    pendingImageItems.forEach((item) => removeFileAndNode(item.id));
    setPendingImageItems(null);
  };

  const markUploadedAndUpdateNode = useCallback(
    (id: string, storageKey: string, fileUrl: string) => {
      markUploaded(id, storageKey, fileUrl);
      if (editorRef.current) {
        updateNodeByUploadId(editorRef.current, id, {
          src: fileUrl,
          uploading: false,
        });
      }
    },
    [markUploaded],
  );

  const core = useFileUploadCore({
    ownerType,
    isAlive: (id) => usePostStore.getState().files.some((f) => f.id === id),
    removeFile: removeFileAndNode,
    markUploaded: markUploadedAndUpdateNode,
    addFiles: addFilesAndInsertNodes,
  });

  // Keep processFiles ref stable for paste/drop handlers
  const processFilesRef = useRef(core.processFiles);
  useEffect(() => {
    processFilesRef.current = core.processFiles;
  });

  /** Stable function for paste/drop handlers (doesn't require editor to be set yet) */
  const processFilesInline = useCallback((files: File[]) => {
    processFilesRef.current(files);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFilesRef.current(Array.from(e.target.files));
    e.target.value = '';
  }, []);

  return {
    imageInputRef,
    fileInputRef,
    setEditor,
    processFilesInline,
    picker: {
      openImagePicker: () => imageInputRef.current?.click(),
      openFilePicker: () => fileInputRef.current?.click(),
    },
    handlers: {
      handleInputChange,
    },
    pendingImageItems,
    confirmImageInsertMode,
    cancelImageInsertMode,
  };
}
