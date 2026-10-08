import { useState, useRef, useEffect, useCallback } from 'react';
import type { Editor } from '@tiptap/core';
import type { Transaction } from '@tiptap/pm/state';
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
  const transactionUnsubRef = useRef<(() => void) | null>(null);

  // 이미지 삽입 방식 선택 다이얼로그: null이면 닫힘, 배열이면 열림
  const [pendingImageItems, setPendingImageItems] = useState<CoreFileItem[] | null>(null);
  // 다이얼로그 열릴 때의 삽입 위치 보존 (NodeSelection 대응)
  const pendingInsertAtRef = useRef<number | { from: number; to: number } | null>(null);

  // 언마운트 시 트랜잭션 구독 해제
  useEffect(
    () => () => {
      transactionUnsubRef.current?.();
    },
    [],
  );

  /** Call this to connect the editor instance after it's created */
  const setEditor = useCallback((editor: Editor | null) => {
    transactionUnsubRef.current?.();
    transactionUnsubRef.current = null;
    editorRef.current = editor;
    if (!editor) return;

    // 다이얼로그가 열린 동안 문서 변경이 발생하면 저장된 삽입 위치를 트랜잭션 매핑으로 갱신.
    // 저장 위치 앞에서 노드가 삭제되면 위치가 밀리거나 범위를 벗어나 잘못된 위치에 삽입될 수 있다.
    const onTransaction = ({ transaction }: { transaction: Transaction }) => {
      if (!transaction.docChanged || pendingInsertAtRef.current === null) return;

      const current = pendingInsertAtRef.current;
      const docSize = transaction.doc.content.size;

      if (typeof current === 'number') {
        const result = transaction.mapping.mapResult(current);
        // 위치 자체가 삭제 범위에 포함되거나 문서 밖으로 벗어나면 현재 커서로 폴백
        pendingInsertAtRef.current = result.deleted || result.pos > docSize ? null : result.pos;
      } else {
        const from = transaction.mapping.map(current.from);
        const to = transaction.mapping.map(current.to, 1);
        pendingInsertAtRef.current = from > docSize ? null : { from, to: Math.min(to, docSize) };
      }
    };

    editor.on('transaction', onTransaction);
    transactionUnsubRef.current = () => editor.off('transaction', onTransaction);
  }, []);

  // Intercept addFiles to also insert nodes into the editor
  const addFilesAndInsertNodes = useCallback(
    (newFiles: CoreFileItem[]) => {
      addFiles(newFiles);

      const currentEditor = editorRef.current;
      if (!currentEditor) return;

      const imageItems = newFiles.filter((item) => isImageFileName(item.fileName));
      const nonImageItems = newFiles.filter((item) => !isImageFileName(item.fileName));

      // NodeSelection으로 atom 노드가 선택된 경우 insertContent는 해당 노드를
      // 대체(replaceWith)하므로, 선택 노드 뒤 위치를 삽입 대상으로 삼는다.
      const { selection } = currentEditor.state;
      const insertAt: number | { from: number; to: number } =
        'node' in selection ? selection.to : { from: selection.from, to: selection.to };

      if (imageItems.length === 0 || imageItems.length === 1) {
        // 비-이미지와 이미지(최대 1장)를 한 번에 삽입 — 개별 insertContent 호출을 피해
        // NodeSelection이 이미 반영된 insertAt 위치에 순서대로 삽입한다.
        const content: Array<{ type: string; attrs: Record<string, unknown> }> = [
          ...nonImageItems.map((item) => ({
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
          ...(imageItems.length === 1
            ? [
                {
                  type: 'inlineImage' as const,
                  attrs: {
                    src: imageItems[0].fileUrl,
                    uploadId: imageItems[0].id,
                    uploading: true,
                  },
                },
              ]
            : []),
        ];
        if (content.length > 0) {
          currentEditor.chain().focus().insertContentAt(insertAt, content).run();
        }
        return;
      }

      // 이미지 2장 이상: 비-이미지를 먼저 삽입한 뒤 다이얼로그 표시.
      // 블록 atom 노드를 개별 insertContent로 체이닝하면 NodeSelection이 이전 노드를
      // 덮어씌우므로, 한 번에 배열로 삽입.
      if (nonImageItems.length > 0) {
        currentEditor
          .chain()
          .focus()
          .insertContentAt(
            insertAt,
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
        // 비-이미지 삽입 후 커서가 이동하므로 다이얼로그에서는 현재 커서 위치에 삽입
        pendingInsertAtRef.current = null;
      } else {
        // 이미지만 있는 경우: NodeSelection이 유지될 수 있으므로 위치 보존
        pendingInsertAtRef.current = insertAt;
      }

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
      pendingInsertAtRef.current = null;
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

    // 다이얼로그 열릴 때 저장해 둔 삽입 위치가 있으면 사용 (NodeSelection 대응),
    // 없으면 현재 커서 위치에 삽입 (비-이미지가 먼저 삽입된 경우)
    const savedInsertAt = pendingInsertAtRef.current;
    const doInsert = (content: Array<{ type: string; attrs: Record<string, unknown> }>) => {
      if (savedInsertAt !== null) {
        currentEditor.chain().focus().insertContentAt(savedInsertAt, content).run();
      } else {
        currentEditor.chain().focus().insertContent(content).run();
      }
    };

    if (mode === 'individual') {
      doInsert(
        activeItems.map((item) => ({
          type: 'inlineImage' as const,
          attrs: getAttrs(item),
        })),
      );
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

      doInsert(
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
      );
    }

    setPendingImageItems(null);
    pendingInsertAtRef.current = null;
  };

  /** 다이얼로그를 취소했을 때 호출 — 업로드 추적 중인 파일을 store에서 제거한다. */
  const cancelImageInsertMode = () => {
    if (!pendingImageItems) return;
    pendingImageItems.forEach((item) => removeFileAndNode(item.id));
    setPendingImageItems(null);
    pendingInsertAtRef.current = null;
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
