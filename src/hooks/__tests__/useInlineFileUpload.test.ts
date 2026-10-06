import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useInlineFileUpload } from '@/hooks/useInlineFileUpload';
import type { CoreFileItem } from '@/hooks/useFileUploadCore';
import { useFileUploadCore } from '@/hooks/useFileUploadCore';

jest.mock('@/hooks/useFileUploadCore', () => ({
  useFileUploadCore: jest.fn(() => ({
    processFiles: jest.fn(),
  })),
}));

jest.mock('@/stores/usePostStore', () => {
  const files: Array<{ id: string; fileUrl: string; uploaded: boolean }> = [];
  interface StoreState {
    files: Array<{ id: string; fileUrl: string; uploaded: boolean }>;
    addFiles: jest.Mock;
    markUploaded: jest.Mock;
    removeFile: jest.Mock;
    getState: jest.Mock;
  }
  const storeState: StoreState = {
    files,
    addFiles: jest.fn((newFiles: CoreFileItem[]) => {
      files.push(...newFiles.map((f) => ({ id: f.id, fileUrl: f.fileUrl, uploaded: f.uploaded })));
    }),
    markUploaded: jest.fn(),
    removeFile: jest.fn((id: string) => {
      const idx = files.findIndex((f) => f.id === id);
      if (idx !== -1) files.splice(idx, 1);
    }),
    getState: jest.fn(() => storeState),
  };

  return {
    usePostStore: Object.assign(
      jest.fn((selector: (s: typeof storeState) => unknown) => selector(storeState)),
      { getState: storeState.getState },
    ),
  };
});

jest.mock('@/stores/useToastStore', () => ({ toast: jest.fn() }));
jest.mock('@/constants/board/file', () => ({
  MAX_IMAGE_FILES: 10,
  MAX_NON_IMAGE_FILES: 5,
}));
jest.mock('@/lib/board/fileUtils', () => ({
  isImageFileName: jest.fn((name: string) => name.endsWith('.png') || name.endsWith('.jpg')),
}));
jest.mock('@/components/board/Editor/extensions/ImageGroup/ImageGroup', () => ({
  MAX_GROUP_IMAGES: 3,
}));

import { usePostStore } from '@/stores/usePostStore';

function makeItem(id: string, fileName = 'img.png'): CoreFileItem {
  return {
    id,
    file: new File([''], fileName),
    fileName,
    fileUrl: `blob:${id}`,
    storageKey: '',
    fileSize: 100,
    contentType: 'image/png',
    uploaded: false,
  };
}

function createMockEditor() {
  const insertedContent: unknown[] = [];
  interface MockChain {
    focus: jest.Mock;
    insertContent: jest.Mock;
    run: jest.Mock;
  }
  const chain: MockChain = {
    focus: jest.fn().mockReturnThis(),
    insertContent: jest.fn((content: unknown) => {
      insertedContent.push(content);
      return chain;
    }),
    run: jest.fn(),
  };
  return {
    chain: jest.fn(() => chain),
    _inserted: insertedContent,
  };
}

/** 가장 최근 renderHook 호출에서 훅이 useFileUploadCore에 전달한 addFiles 콜백을 반환 */
function getAddFilesCallback(): (items: CoreFileItem[]) => void {
  const calls = (useFileUploadCore as jest.Mock).mock.calls;
  return calls[calls.length - 1][0].addFiles;
}

describe('useInlineFileUpload', () => {
  beforeEach(() => {
    (useFileUploadCore as jest.Mock).mockClear();
    const state = (
      usePostStore as unknown as { getState: () => { files: Array<unknown> } }
    ).getState();
    state.files.length = 0;
  });

  describe('confirmImageInsertMode', () => {
    it('pendingImageItems가 없으면 아무것도 하지 않는다', () => {
      const { result } = renderHook(() => useInlineFileUpload());
      const mockEditor = createMockEditor();
      act(() => {
        result.current.setEditor(mockEditor as never);
      });

      act(() => {
        result.current.confirmImageInsertMode('individual');
      });

      expect(mockEditor.chain).not.toHaveBeenCalled();
    });

    it('individual 모드에서 pendingImageItems의 이미지를 inlineImage로 삽입한다', () => {
      const item1 = makeItem('img-1');
      const item2 = makeItem('img-2');

      const { result } = renderHook(() => useInlineFileUpload());
      const mockEditor = createMockEditor();
      act(() => {
        result.current.setEditor(mockEditor as never);
      });

      // 이미지 2장 전달 → addFilesAndInsertNodes 내부에서 pendingImageItems 설정
      const addFilesAndInsertNodes = getAddFilesCallback();
      act(() => {
        addFilesAndInsertNodes([item1, item2]);
      });

      expect(result.current.pendingImageItems).toHaveLength(2);

      act(() => {
        result.current.confirmImageInsertMode('individual');
      });

      expect(mockEditor._inserted).toHaveLength(1);
      expect(mockEditor._inserted[0]).toEqual([
        { type: 'inlineImage', attrs: { src: 'blob:img-1', uploadId: 'img-1', uploading: true } },
        { type: 'inlineImage', attrs: { src: 'blob:img-2', uploadId: 'img-2', uploading: true } },
      ]);
      expect(result.current.pendingImageItems).toBeNull();
    });

    it('업로드 실패로 store에서 제거된 항목은 삽입하지 않는다', () => {
      const item1 = makeItem('ok-1');
      const item2 = makeItem('fail-2');

      const { result } = renderHook(() => useInlineFileUpload());
      const mockEditor = createMockEditor();
      act(() => {
        result.current.setEditor(mockEditor as never);
      });

      // 두 항목 모두 전달 → pendingImageItems = [item1, item2], store에도 둘 다 추가
      const addFilesAndInsertNodes = getAddFilesCallback();
      act(() => {
        addFilesAndInsertNodes([item1, item2]);
      });

      expect(result.current.pendingImageItems).toHaveLength(2);

      // fail-2가 업로드 실패로 store에서 제거
      const removeFile = (
        usePostStore as unknown as { getState: () => { removeFile: (id: string) => void } }
      ).getState().removeFile;
      act(() => {
        removeFile('fail-2');
      });

      act(() => {
        result.current.confirmImageInsertMode('individual');
      });

      // store에 남은 ok-1만 삽입
      expect(mockEditor._inserted).toHaveLength(1);
      expect(mockEditor._inserted[0]).toEqual([
        { type: 'inlineImage', attrs: { src: 'blob:ok-1', uploadId: 'ok-1', uploading: true } },
      ]);
    });
  });

  describe('cancelImageInsertMode', () => {
    it('pendingImageItems가 없으면 아무것도 하지 않는다', () => {
      const { result } = renderHook(() => useInlineFileUpload());
      const removeFile = (
        usePostStore as unknown as { getState: () => { removeFile: jest.Mock } }
      ).getState().removeFile;
      (removeFile as jest.Mock).mockClear();

      act(() => {
        result.current.cancelImageInsertMode();
      });

      expect(removeFile).not.toHaveBeenCalled();
    });
  });

  describe('setEditor', () => {
    it('setEditor에 null을 전달하면 에디터 참조가 해제된다', () => {
      const { result } = renderHook(() => useInlineFileUpload());
      const mockEditor = createMockEditor();

      act(() => {
        result.current.setEditor(mockEditor as never);
      });
      act(() => {
        result.current.setEditor(null);
      });

      act(() => {
        result.current.confirmImageInsertMode('individual');
      });
    });
  });

  describe('processFilesInline', () => {
    it('processFilesInline이 안정된 함수 참조를 반환한다', () => {
      const { result, rerender } = renderHook(() => useInlineFileUpload());
      const fn1 = result.current.processFilesInline;
      rerender();
      expect(result.current.processFilesInline).toBe(fn1);
    });
  });

  describe('picker', () => {
    it('openImagePicker가 예외 없이 실행된다 (input ref에 click 위임)', () => {
      const { result } = renderHook(() => useInlineFileUpload());
      const mockClick = jest.fn();
      (result.current.imageInputRef as React.MutableRefObject<HTMLInputElement | null>).current = {
        click: mockClick,
      } as never;

      act(() => {
        result.current.picker.openImagePicker();
      });

      expect(mockClick).toHaveBeenCalledTimes(1);
    });
  });
});
