import { renderHook, act } from '@testing-library/react';
import { useLinkPopup } from '../useLinkPopup';
import type { Editor } from '@tiptap/core';

function createMockEditor() {
  return {
    state: { selection: { from: 5 } },
    view: {
      coordsAtPos: jest.fn(() => ({ bottom: 100, left: 50 })),
    },
  } as unknown as Editor;
}

describe('useLinkPopup', () => {
  it('초기 pos는 null이다', () => {
    const { result } = renderHook(() => useLinkPopup(null));
    expect(result.current.pos).toBeNull();
  });

  it('close() 호출 시 pos가 null이 된다', () => {
    const editor = createMockEditor();
    const { result } = renderHook(() => useLinkPopup(editor));

    act(() => result.current.openFromSlashMenu());
    expect(result.current.pos).not.toBeNull();

    act(() => result.current.close());
    expect(result.current.pos).toBeNull();
  });

  describe('openFromSlashMenu', () => {
    it('editor가 null이면 pos가 변하지 않는다', () => {
      const { result } = renderHook(() => useLinkPopup(null));

      act(() => result.current.openFromSlashMenu());

      expect(result.current.pos).toBeNull();
    });

    it('에디터 커서 아래 8px, 왼쪽 정렬로 pos를 설정한다', () => {
      const editor = createMockEditor();
      const { result } = renderHook(() => useLinkPopup(editor));

      act(() => result.current.openFromSlashMenu());

      // coordsAtPos: { bottom: 100, left: 50 } → top = 100 + 8
      expect(result.current.pos).toEqual({ top: 108, left: 50 });
    });
  });

  describe('handleEditorClick', () => {
    it('a[href]가 없는 요소 클릭은 pos를 변경하지 않는다', () => {
      const { result } = renderHook(() => useLinkPopup(null));
      const div = document.createElement('div');

      act(() => {
        result.current.handleEditorClick({ target: div } as unknown as React.MouseEvent);
      });

      expect(result.current.pos).toBeNull();
    });

    it('<a href> 요소 클릭 시 링크 하단 8px 위치로 pos를 설정한다', () => {
      const { result } = renderHook(() => useLinkPopup(null));

      const anchor = document.createElement('a');
      anchor.setAttribute('href', 'https://example.com');
      jest.spyOn(anchor, 'getBoundingClientRect').mockReturnValue({
        bottom: 200,
        left: 100,
        top: 0,
        right: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect);

      act(() => {
        result.current.handleEditorClick({ target: anchor } as unknown as React.MouseEvent);
      });

      expect(result.current.pos).toEqual({ top: 208, left: 100 });
    });

    it('<a href> 내부 자식 요소 클릭 시 closest로 부모 링크를 찾아 pos를 설정한다', () => {
      const { result } = renderHook(() => useLinkPopup(null));

      const anchor = document.createElement('a');
      anchor.setAttribute('href', 'https://example.com');
      jest.spyOn(anchor, 'getBoundingClientRect').mockReturnValue({
        bottom: 200,
        left: 100,
        top: 0,
        right: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect);
      const span = document.createElement('span');
      anchor.appendChild(span);

      act(() => {
        result.current.handleEditorClick({ target: span } as unknown as React.MouseEvent);
      });

      expect(result.current.pos).toEqual({ top: 208, left: 100 });
    });
  });
});
