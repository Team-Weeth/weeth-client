import { renderHook, act } from '@testing-library/react';
import { useAdjacentNodes } from '@/components/board/Editor/extensions/useAdjacentNodes';

type MockNode = { isTextblock: boolean; type: { name: string } };

function createMockEditor(options: {
  nodeBeforeAtPos?: MockNode | null;
  nodeAfterAtAfterPos?: MockNode | null;
  docSize?: number;
}) {
  const { nodeBeforeAtPos = null, nodeAfterAtAfterPos = null, docSize = 100 } = options;
  const listeners: Record<string, Array<() => void>> = {};

  const editor = {
    state: {
      doc: {
        resolve: jest.fn((pos: number) => {
          // getPos() === 5 → nodeBefore
          // getPos() + nodeSize === 10 → nodeAfter
          if (pos === 5) return { nodeBefore: nodeBeforeAtPos, nodeAfter: null };
          return { nodeBefore: null, nodeAfter: nodeAfterAtAfterPos };
        }),
        content: { size: docSize },
      },
    },
    on: jest.fn((event: string, handler: () => void) => {
      listeners[event] = listeners[event] ?? [];
      listeners[event].push(handler);
    }),
    off: jest.fn((event: string, handler: () => void) => {
      listeners[event] = (listeners[event] ?? []).filter((h) => h !== handler);
    }),
    _trigger(event: string) {
      listeners[event]?.forEach((h) => h());
    },
  };

  return editor;
}

const NODE_SIZE = 5;
const getPos = () => 5;

describe('useAdjacentNodes', () => {
  it('초기값으로 nodeBefore/nodeAfter를 반환한다', () => {
    const nodeBefore: MockNode = { isTextblock: false, type: { name: 'imageGroup' } };
    const editor = createMockEditor({ nodeBeforeAtPos: nodeBefore });

    const { result } = renderHook(() => useAdjacentNodes(editor as never, getPos, NODE_SIZE));

    expect(result.current.nodeBefore).toBe(nodeBefore);
    expect(result.current.nodeAfter).toBeNull();
  });

  it('editor.on("update")를 구독하고, 이벤트 발생 시 상태를 갱신한다', () => {
    const nodeAfter: MockNode = { isTextblock: true, type: { name: 'paragraph' } };
    const editor = createMockEditor({});

    const { result } = renderHook(() => useAdjacentNodes(editor as never, getPos, NODE_SIZE));

    expect(result.current.nodeAfter).toBeNull();
    expect(editor.on).toHaveBeenCalledWith('update', expect.any(Function));

    // 에디터 상태 갱신 시뮬레이션: resolve가 새 nodeAfter를 반환하도록 변경
    editor.state.doc.resolve.mockImplementation((pos: number) => {
      if (pos === 5) return { nodeBefore: null, nodeAfter: null };
      return { nodeBefore: null, nodeAfter: nodeAfter };
    });

    act(() => {
      editor._trigger('update');
    });

    expect(result.current.nodeAfter).toBe(nodeAfter);
  });

  it('언마운트 시 editor.off("update")를 호출한다', () => {
    const editor = createMockEditor({});

    const { unmount } = renderHook(() => useAdjacentNodes(editor as never, getPos, NODE_SIZE));

    unmount();

    expect(editor.off).toHaveBeenCalledWith('update', expect.any(Function));
  });

  it('nodeBefore/nodeAfter가 변경되지 않으면 상태 객체를 재생성하지 않는다 (참조 안정성)', () => {
    const nodeBefore: MockNode = { isTextblock: false, type: { name: 'imageGroup' } };
    const editor = createMockEditor({ nodeBeforeAtPos: nodeBefore });

    const { result } = renderHook(() => useAdjacentNodes(editor as never, getPos, NODE_SIZE));

    const initialRef = result.current;

    act(() => {
      editor._trigger('update');
    });

    // 값이 동일하면 동일한 객체 참조를 유지
    expect(result.current).toBe(initialRef);
  });

  it('afterPos가 doc.content.size를 초과하면 nodeAfter를 null로 반환한다', () => {
    // docSize < getPos() + nodeSize → afterPos 초과
    const editor = createMockEditor({
      docSize: 8,
      nodeAfterAtAfterPos: { isTextblock: true, type: { name: 'paragraph' } },
    });

    const { result } = renderHook(() => useAdjacentNodes(editor as never, getPos, NODE_SIZE));

    // afterPos = 5 + 5 = 10 > docSize(8) → nodeAfter는 null
    expect(result.current.nodeAfter).toBeNull();
  });

  it('getPos() 호출이 예외를 던지면 { nodeBefore: null, nodeAfter: null }을 반환한다', () => {
    const editor = createMockEditor({});
    editor.state.doc.resolve.mockImplementation(() => {
      throw new Error('RangeError');
    });

    const { result } = renderHook(() =>
      useAdjacentNodes(
        editor as never,
        () => {
          throw new Error('no pos');
        },
        NODE_SIZE,
      ),
    );

    expect(result.current.nodeBefore).toBeNull();
    expect(result.current.nodeAfter).toBeNull();
  });
});
