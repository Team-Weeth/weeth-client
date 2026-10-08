import type { MutableRefObject } from 'react';
import type { EditorView } from '@tiptap/pm/view';
import type { Slice } from '@tiptap/pm/model';
import { sniffAsImageFile } from '@/lib/board/imageSniff';

/**
 * TipTap handlePaste 핸들러 팩토리.
 * processFilesRef를 캡처해 stale closure 없이 최신 함수를 참조한다.
 */
export function createPasteHandler(
  processFilesRef: MutableRefObject<((files: File[]) => void) | undefined>,
): (view: EditorView, event: ClipboardEvent, slice: Slice) => boolean {
  return (view, event, slice) => {
    const clipboardFiles = event.clipboardData?.files;
    if (clipboardFiles && clipboardFiles.length > 0) {
      processFilesRef.current?.(Array.from(clipboardFiles));
      return true;
    }

    // files가 비어있을 때 items에서 이미지 추출
    // (브라우저 이미지 복사·스크린샷 등은 files 대신 items에만 존재)
    const items = event.clipboardData?.items;
    if (items) {
      const imageFiles = Array.from(items)
        .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
        .map((item) => item.getAsFile())
        .filter((f): f is File => f !== null);
      if (imageFiles.length > 0) {
        processFilesRef.current?.(imageFiles);
        return true;
      }

      // MIME 유형이 비어 있는 파일 항목: 실제 바이트를 확인해 이미지 여부 판정
      // (스크린샷·일부 브라우저에서 type이 빈 문자열로 올 수 있음)
      const untypedFiles = Array.from(items)
        .filter((item) => item.kind === 'file' && item.type === '')
        .map((item) => item.getAsFile())
        .filter((f): f is File => f !== null);
      if (untypedFiles.length > 0) {
        void (async () => {
          const detected = await Promise.all(untypedFiles.map(sniffAsImageFile));
          const validImages = detected.filter((f): f is File => f !== null);
          if (validImages.length > 0) processFilesRef.current?.(validImages);
        })();
        return true;
      }
    }

    // NodeSelection 상태에서 tiptap 기본 동작은 선택된 노드를 붙여넣기 내용으로
    // 교체(replaceWith)한다. 직접 slice를 선택 노드 하단에 삽입하여 교체를 방지한다.
    const { selection } = view.state;
    if ('node' in selection && slice) {
      const tr = view.state.tr;
      tr.replaceRange(selection.to, selection.to, slice);
      tr.scrollIntoView();
      view.dispatch(tr);
      return true;
    }

    return false;
  };
}
