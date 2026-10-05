'use client';

import { useEditor } from '@tiptap/react';
import { TextSelection } from '@tiptap/pm/state';
import type { Transaction } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';
import { useState, useRef, useEffect } from 'react';
import { usePostStore } from '@/stores/usePostStore';
import { editorExtensions } from './extensions';
import { SUB_DRAG_TYPE, removeImageFromGroup } from './extensions/ImageGroup/imageGroupUtils';
import { MAX_GROUP_IMAGES } from './extensions/ImageGroup/ImageGroup';
import type { GroupImage } from './extensions/ImageGroup/ImageGroup';

const LIST_TYPES = ['bulletList', 'orderedList', 'taskList'];

interface SideDropResult {
  targetPos: number;
  targetNodeType: string;
  side: 'left' | 'right';
}

function detectSideDrop(view: EditorView, event: DragEvent): SideDropResult | null {
  const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
  if (!coords) return null;

  const pos = coords.inside >= 0 ? coords.inside : coords.pos;
  const node = view.state.doc.nodeAt(pos);
  if (!node) return null;

  if (node.type.name !== 'inlineImage' && node.type.name !== 'imageGroup') return null;

  const dom = view.nodeDOM(pos);
  if (!dom || !(dom instanceof HTMLElement)) return null;

  const rect = dom.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const threshold = rect.width * 0.3;

  if (x < threshold) {
    return { targetPos: pos, targetNodeType: node.type.name, side: 'left' };
  } else if (x > rect.width - threshold) {
    return { targetPos: pos, targetNodeType: node.type.name, side: 'right' };
  }

  return null;
}

/**
 * 사이드 드롭 시 이미지를 타겟 위치에 추가하는 트랜잭션을 반환.
 * 타겟 그룹이 가득 찼거나 타겟 노드가 없으면 null 반환 (소스 이미지를 제거해선 안 됨).
 */
function buildSideDropTransaction(
  view: EditorView,
  result: SideDropResult,
  image: GroupImage,
): Transaction | null {
  const targetNode = view.state.doc.nodeAt(result.targetPos);
  if (!targetNode) return null;

  if (targetNode.type.name === 'inlineImage') {
    const targetImage: GroupImage = {
      src: targetNode.attrs.src as string,
      alt: (targetNode.attrs.alt as string) ?? null,
      width: (targetNode.attrs.width as number) ?? null,
      uploadId: (targetNode.attrs.uploadId as string) ?? null,
      uploading: (targetNode.attrs.uploading as boolean) ?? false,
    };
    const images = result.side === 'left' ? [image, targetImage] : [targetImage, image];
    const groupNode = view.state.schema.nodes.imageGroup.create({ images });
    return view.state.tr.replaceWith(
      result.targetPos,
      result.targetPos + targetNode.nodeSize,
      groupNode,
    );
  } else if (targetNode.type.name === 'imageGroup') {
    const existingImages = [...(targetNode.attrs.images as GroupImage[])];
    if (existingImages.length >= MAX_GROUP_IMAGES) return null;
    if (result.side === 'left') {
      existingImages.unshift(image);
    } else {
      existingImages.push(image);
    }
    return view.state.tr.setNodeMarkup(result.targetPos, undefined, {
      ...targetNode.attrs,
      images: existingImages,
    });
  }
  return null;
}

function findNodePosByAttrs(
  view: EditorView,
  typeName: string,
  attrs: Record<string, unknown>,
): number | null {
  let foundPos: number | null = null;
  view.state.doc.descendants((node, pos) => {
    if (foundPos !== null) return false;
    if (node.type.name === typeName && node.attrs.src === attrs.src) {
      foundPos = pos;
      return false;
    }
  });
  return foundPos;
}

interface UsePostEditorOptions {
  processFilesInline?: (files: File[]) => void;
  initialContent?: string;
}

export function usePostEditor({ processFilesInline, initialContent }: UsePostEditorOptions = {}) {
  const setContent = usePostStore((state) => state.setContent);
  // 마운트 시점에 한 번만 초기 content 고정 (수정 페이지용)
  const [initialContentValue] = useState(() => initialContent ?? '');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  // ref로 최신 상태 유지 → useEditor 내부 handleKeyDown stale closure 방지
  const showSlashMenuRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const processFilesRef = useRef(processFilesInline);
  useEffect(() => {
    processFilesRef.current = processFilesInline;
  });

  const closeSlashMenu = () => {
    showSlashMenuRef.current = false;
    setShowSlashMenu(false);
  };

  const updateSlashMenuState = (isSlash: boolean) => {
    showSlashMenuRef.current = isSlash;
    setShowSlashMenu(isSlash);
  };

  const editor = useEditor({
    extensions: editorExtensions,
    content: initialContentValue,

    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
      const { $from } = editor.state.selection;
      const text = $from.nodeBefore?.textContent ?? '';
      updateSlashMenuState(/\/[^\s]*$/.test(text));
    },

    // 커서 이동만으로 '/' 뒤를 벗어났을 때도 메뉴를 닫기 위해 추적
    onSelectionUpdate: ({ editor }) => {
      if (!showSlashMenuRef.current) return;
      const { $from } = editor.state.selection;
      const text = $from.nodeBefore?.textContent ?? '';
      if (!/\/[^\s]*$/.test(text)) {
        closeSlashMenu();
      }
    },

    editorProps: {
      handlePaste: (_view, event) => {
        const clipboardFiles = event.clipboardData?.files;
        if (clipboardFiles && clipboardFiles.length > 0) {
          processFilesRef.current?.(Array.from(clipboardFiles));
          return true;
        }
        return false;
      },

      handleDrop: (view, event) => {
        // 1. 외부 파일 드롭
        const droppedFiles = event.dataTransfer?.files;
        if (droppedFiles && droppedFiles.length > 0) {
          event.preventDefault();
          processFilesRef.current?.(Array.from(droppedFiles));
          return true;
        }

        // 2. 서브 드래그 처리 (그룹 내 이미지 분리)
        const subDragData = event.dataTransfer?.getData(SUB_DRAG_TYPE);
        if (subDragData) {
          const { image, sourceGroupPos, sourceIdx } = JSON.parse(subDragData) as {
            image: GroupImage;
            sourceGroupPos: number;
            sourceIdx: number;
          };

          // 드롭 대상이 imageGroup NodeView 내부인지 확인.
          // GapZone 등 containerRef 외부지만 같은 NodeView 내부에 드롭된 경우
          // 이미지를 제거하면 안 되므로 no-op 처리.
          // (containerRef 내부의 드롭은 onNativeDrop에서 stopPropagation되어 여기 도달하지 않음)
          const target = event.target as HTMLElement;
          if (target.closest('.node-imageGroup')) {
            event.preventDefault();
            return true;
          }

          // 사이드 드롭 확인
          const sideResult = detectSideDrop(view, event);
          if (sideResult) {
            event.preventDefault();
            const sideTr = buildSideDropTransaction(view, sideResult, image);
            if (sideTr) {
              // sourceGroupPos를 사이드 드롭 트랜잭션의 매핑으로 보정한 후 제거
              const mappedSourceGroupPos = sideTr.mapping.map(sourceGroupPos);
              view.dispatch(sideTr);
              removeImageFromGroup(view, mappedSourceGroupPos, sourceIdx);
            }
            // sideTr === null: 대상 그룹이 가득 참 → 소스 이미지 유지
            return true;
          }

          // 일반 위치에 독립 이미지로 배치
          event.preventDefault();
          removeImageFromGroup(view, sourceGroupPos, sourceIdx);

          const dropPos = view.posAtCoords({ left: event.clientX, top: event.clientY });
          if (dropPos) {
            const inlineImageNode = view.state.schema.nodes.inlineImage.create({
              src: image.src,
              alt: image.alt,
              width: image.width,
              uploadId: image.uploadId,
              uploading: image.uploading,
            });
            const tr = view.state.tr.insert(dropPos.pos, inlineImageNode);
            view.dispatch(tr);
          }
          return true;
        }

        // 3. 사이드 드롭 처리 (기존 이미지 → 그룹화)
        const dragging = (
          view as unknown as {
            dragging?: {
              slice?: {
                content?: {
                  firstChild?: { type: { name: string }; attrs: Record<string, unknown> };
                };
              };
            };
          }
        ).dragging;
        const draggedNode = dragging?.slice?.content?.firstChild;
        if (draggedNode && draggedNode.type.name === 'inlineImage') {
          const sideResult = detectSideDrop(view, event);
          if (sideResult) {
            event.preventDefault();
            const draggedImage: GroupImage = {
              src: draggedNode.attrs.src as string,
              alt: (draggedNode.attrs.alt as string) ?? null,
              width: (draggedNode.attrs.width as number) ?? null,
              uploadId: (draggedNode.attrs.uploadId as string) ?? null,
              uploading: (draggedNode.attrs.uploading as boolean) ?? false,
            };

            // 소스 이미지 위치 찾기 및 삭제
            const sourcePos = findNodePosByAttrs(view, 'inlineImage', draggedNode.attrs);
            if (sourcePos !== null) {
              const sourceNode = view.state.doc.nodeAt(sourcePos);
              if (sourceNode) {
                // 소스 삭제 후 target 위치를 mapping으로 보정 (DOM 재탐색 불필요)
                const deleteTr = view.state.tr.delete(sourcePos, sourcePos + sourceNode.nodeSize);
                const mappedTargetPos = deleteTr.mapping.map(sideResult.targetPos);
                // 삭제된 소스가 선택 중이면 syncNodeSelection 충돌 방지
                deleteTr.setSelection(
                  TextSelection.near(
                    deleteTr.doc.resolve(Math.min(sourcePos, deleteTr.doc.content.size)),
                  ),
                );
                view.dispatch(deleteTr);

                if (view.state.doc.nodeAt(mappedTargetPos)) {
                  const sideTr = buildSideDropTransaction(
                    view,
                    { ...sideResult, targetPos: mappedTargetPos },
                    draggedImage,
                  );
                  if (sideTr) view.dispatch(sideTr);
                }
              }
            }
            return true;
          }
        }

        return false;
      },

      handleKeyDown: (view, event) => {
        // 슬래시 메뉴 우선 처리 (ref로 stale closure 없이 최신 값 참조)
        if (showSlashMenuRef.current) {
          if (event.key === 'Enter' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
            return true;
          }
        }

        const { state } = view;
        const { $from } = state.selection;

        // 백틱 인라인 코드 단축키
        if (event.key === '`') {
          const blockStart = $from.start();
          const textBefore = state.doc.textBetween(blockStart, $from.pos);
          const openIndex = textBefore.lastIndexOf('`');

          if (openIndex !== -1) {
            const innerText = textBefore.slice(openIndex + 1);

            if (innerText.length > 0) {
              event.preventDefault();
              const from = blockStart + openIndex;
              const to = $from.pos;
              const codeMark = state.schema.marks.code.create();
              const codeText = state.schema.text(innerText, [codeMark]);
              const tr = state.tr.replaceWith(from, to, codeText);
              tr.removeStoredMark(state.schema.marks.code);

              view.dispatch(tr);
              return true;
            }
          }
        }

        // Backspace UX 개선
        if (event.key === 'Backspace') {
          if ($from.parentOffset === 0 && $from.parent.textContent === '') {
            // 빈 헤딩 → 일반 단락으로 전환
            if ($from.parent.type.name === 'heading') {
              view.dispatch(
                state.tr.setBlockType($from.pos, $from.pos, state.schema.nodes.paragraph),
              );
              return true;
            }

            // 빈 paragraph가 리스트 바로 뒤에 있을 때 리스트 재진입 방지
            if ($from.depth < 1) return false;
            const resolvedPos = state.doc.resolve($from.before());
            const nodeBefore = resolvedPos.nodeBefore;

            if (
              $from.parent.type.name === 'paragraph' &&
              nodeBefore &&
              LIST_TYPES.includes(nodeBefore.type.name)
            ) {
              const paragraphStart = $from.before();
              const paragraphEnd = $from.after();
              const endOfPrevNode = paragraphStart - 1;
              const tr = state.tr.delete(paragraphStart, paragraphEnd);
              const mappedPos = tr.mapping.map(endOfPrevNode);
              tr.setSelection(TextSelection.near(tr.doc.resolve(mappedPos), -1));
              view.dispatch(tr);
              return true;
            }
          }
        }

        return false;
      },
    },
  });

  return { editor, showSlashMenu, closeSlashMenu, containerRef };
}
