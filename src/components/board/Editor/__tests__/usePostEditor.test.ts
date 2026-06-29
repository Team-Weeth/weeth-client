import { renderHook, act } from '@testing-library/react';
import { useEditor } from '@tiptap/react';
import { usePostEditor } from '@/components/board/Editor/usePostEditor';

jest.mock('@tiptap/react', () => ({ useEditor: jest.fn() }));
jest.mock('@/stores/usePostStore');
// editorExtensions 의존성 차단 (lowlight 등 heavy import 방지)
jest.mock('@/components/board/Editor/extensions', () => ({ editorExtensions: [] }));
// TextSelection.near는 실제 ProseMirror 문서가 필요하므로 mock
jest.mock('@tiptap/pm/state', () => ({
  ...jest.requireActual('@tiptap/pm/state'),
  TextSelection: { near: jest.fn(() => ({})) },
}));

const useEditorMock = useEditor as jest.Mock;

// usePostStore는 selector 패턴: usePostStore(state => state.setContent)
const { usePostStore } = jest.requireMock('@/stores/usePostStore') as {
  usePostStore: jest.Mock;
};
const mockSetContent = jest.fn();

// useEditor 호출 시 넘어온 config를 전역 변수로 캡처
type EditorPropsHandler = (
  view: Record<string, unknown>,
  event: Record<string, unknown>,
) => boolean;
type EditorEventCallback = (args: Record<string, unknown>) => void;

interface CapturedEditorConfig {
  editorProps: {
    handlePaste: EditorPropsHandler;
    handleDrop: EditorPropsHandler;
    handleKeyDown: EditorPropsHandler;
  };
  onUpdate: EditorEventCallback;
  onSelectionUpdate: EditorEventCallback;
}

let capturedConfig = {} as CapturedEditorConfig;

// 슬래시 메뉴 차단 테스트: return true 이전에 view에 접근하지 않으므로 $from만 있으면 됨
const minimalView = {
  state: { selection: { $from: {} } },
};

// 백틱 인라인 코드 단축키 테스트용 view mock
function createBacktickView(textBefore: string) {
  const blockStart = 1;
  const fromPos = blockStart + textBefore.length;
  const tr = {
    replaceWith: jest.fn().mockReturnThis(),
    removeStoredMark: jest.fn().mockReturnThis(),
  };
  return {
    view: {
      state: {
        selection: { $from: { start: jest.fn(() => blockStart), pos: fromPos } },
        doc: { textBetween: jest.fn().mockReturnValue(textBefore) },
        schema: {
          marks: { code: { create: jest.fn(() => ({})) } },
          text: jest.fn(() => ({})),
        },
        tr,
      },
      dispatch: jest.fn(),
    },
    tr,
  };
}

// Backspace UX 개선 테스트용 view mock
interface BackspaceViewOptions {
  parentType: string;
  nodeBeforeType?: string | null;
  parentOffset?: number;
}

function createBackspaceView({
  parentType,
  nodeBeforeType = null,
  parentOffset = 0,
}: BackspaceViewOptions) {
  const nodeBefore = nodeBeforeType ? { type: { name: nodeBeforeType } } : null;
  const tr = {
    setBlockType: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    mapping: { map: jest.fn(() => 3) },
    setSelection: jest.fn().mockReturnThis(),
    doc: { resolve: jest.fn(() => ({})) },
  };
  return {
    view: {
      state: {
        selection: {
          $from: {
            parentOffset,
            pos: 5,
            before: jest.fn(() => 4),
            after: jest.fn(() => 10),
            parent: { type: { name: parentType }, textContent: '' },
          },
        },
        doc: { resolve: jest.fn(() => ({ nodeBefore })) },
        schema: { nodes: { paragraph: {} } },
        tr,
      },
      dispatch: jest.fn(),
    },
    tr,
  };
}

// 슬래시 메뉴를 열기 위해 onUpdate를 직접 호출하는 헬퍼
function openSlashMenu() {
  act(() => {
    capturedConfig.onUpdate({
      editor: {
        getHTML: () => '<p>/</p>',
        state: { selection: { $from: { nodeBefore: { textContent: '/' } } } },
      },
    });
  });
}

describe('usePostEditor', () => {
  beforeEach(() => {
    usePostStore.mockImplementation((selector: (s: unknown) => unknown) =>
      selector({ setContent: mockSetContent }),
    );
    useEditorMock.mockImplementation((config: unknown) => {
      capturedConfig = config as CapturedEditorConfig;
      return null; // editor 인스턴스는 이 테스트에서 불필요
    });
  });

  describe('processFilesRef stale closure 방지', () => {
    it('processFiles가 변경되면 최신 함수를 참조한다', () => {
      const fn1 = jest.fn();
      const fn2 = jest.fn();
      const file = new File([''], 'test.png', { type: 'image/png' });

      const { rerender } = renderHook(
        ({ processFiles }: { processFiles: (f: File[]) => void }) =>
          usePostEditor({ processFiles }),
        { initialProps: { processFiles: fn1 } },
      );

      rerender({ processFiles: fn2 });

      // rerender 후 paste 발생 → fn2가 호출되어야 함 (fn1 stale 아님)
      capturedConfig.editorProps.handlePaste({}, { clipboardData: { files: [file] } });

      expect(fn2).toHaveBeenCalledWith([file]);
      expect(fn1).not.toHaveBeenCalled();
    });
  });

  describe('handlePaste', () => {
    it('파일이 있으면 processFiles를 호출하고 true를 반환한다', () => {
      const processFiles = jest.fn();
      renderHook(() => usePostEditor({ processFiles }));

      const file = new File([''], 'image.png', { type: 'image/png' });
      const result = capturedConfig.editorProps.handlePaste(
        {},
        { clipboardData: { files: [file] } },
      );

      expect(processFiles).toHaveBeenCalledWith([file]);
      expect(result).toBe(true);
    });

    it('파일이 없으면 false를 반환한다', () => {
      renderHook(() => usePostEditor());

      const result = capturedConfig.editorProps.handlePaste({}, { clipboardData: { files: [] } });

      expect(result).toBe(false);
    });

    it('clipboardData가 없으면 false를 반환한다', () => {
      renderHook(() => usePostEditor());

      const result = capturedConfig.editorProps.handlePaste({}, {});

      expect(result).toBe(false);
    });
  });

  describe('handleDrop', () => {
    it('파일이 있으면 preventDefault 호출 후 processFiles를 실행하고 true를 반환한다', () => {
      const processFiles = jest.fn();
      renderHook(() => usePostEditor({ processFiles }));

      const file = new File([''], 'doc.pdf');
      const event = { preventDefault: jest.fn(), dataTransfer: { files: [file] } };
      const result = capturedConfig.editorProps.handleDrop({}, event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(processFiles).toHaveBeenCalledWith([file]);
      expect(result).toBe(true);
    });

    it('파일이 없으면 false를 반환한다', () => {
      renderHook(() => usePostEditor());

      const result = capturedConfig.editorProps.handleDrop({}, { dataTransfer: { files: [] } });

      expect(result).toBe(false);
    });

    it('dataTransfer가 없으면 false를 반환한다', () => {
      renderHook(() => usePostEditor());

      const result = capturedConfig.editorProps.handleDrop({}, {});

      expect(result).toBe(false);
    });
  });

  describe('handleKeyDown — 백틱 인라인 코드 단축키', () => {
    it('이전 백틱이 있고 내부 텍스트가 있으면 code mark를 적용하고 true를 반환한다', () => {
      renderHook(() => usePostEditor());
      const { view, tr } = createBacktickView('hello `world');
      const event = { key: '`', preventDefault: jest.fn() };

      const result = capturedConfig.editorProps.handleKeyDown(view, event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(tr.replaceWith).toHaveBeenCalled();
      expect(tr.removeStoredMark).toHaveBeenCalled();
      expect(view.dispatch).toHaveBeenCalledWith(tr);
      expect(result).toBe(true);
    });

    it('이전 백틱이 없으면 false를 반환한다', () => {
      renderHook(() => usePostEditor());
      const { view } = createBacktickView('hello world');
      const event = { key: '`', preventDefault: jest.fn() };

      const result = capturedConfig.editorProps.handleKeyDown(view, event);

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('백틱 이후 내부 텍스트가 없으면 false를 반환한다', () => {
      renderHook(() => usePostEditor());
      // 텍스트가 정확히 "`" 로 끝남 → openIndex 찾지만 innerText === ''
      const { view } = createBacktickView('hello `');
      const event = { key: '`', preventDefault: jest.fn() };

      const result = capturedConfig.editorProps.handleKeyDown(view, event);

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('handleKeyDown — Backspace UX 개선', () => {
    it('빈 헤딩에서 Backspace → paragraph로 전환하고 true를 반환한다', () => {
      renderHook(() => usePostEditor());
      const { view, tr } = createBackspaceView({ parentType: 'heading' });
      const event = { key: 'Backspace', preventDefault: jest.fn() };

      const result = capturedConfig.editorProps.handleKeyDown(view, event);

      expect(tr.setBlockType).toHaveBeenCalled();
      expect(view.dispatch).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it.each(['bulletList', 'orderedList', 'taskList'])(
      '빈 paragraph가 %s 바로 뒤에 있을 때 Backspace → 리스트 재진입 방지하고 true를 반환한다',
      (listType) => {
        renderHook(() => usePostEditor());
        const { view, tr } = createBackspaceView({
          parentType: 'paragraph',
          nodeBeforeType: listType,
        });
        const event = { key: 'Backspace', preventDefault: jest.fn() };

        const result = capturedConfig.editorProps.handleKeyDown(view, event);

        expect(tr.delete).toHaveBeenCalled();
        expect(tr.setSelection).toHaveBeenCalled();
        expect(view.dispatch).toHaveBeenCalled();
        expect(result).toBe(true);
      },
    );

    it('빈 paragraph이지만 앞 노드가 리스트가 아니면 false를 반환한다', () => {
      renderHook(() => usePostEditor());
      const { view } = createBackspaceView({
        parentType: 'paragraph',
        nodeBeforeType: 'paragraph',
      });
      const event = { key: 'Backspace', preventDefault: jest.fn() };

      const result = capturedConfig.editorProps.handleKeyDown(view, event);

      expect(result).toBe(false);
    });

    it('커서가 블록 시작이 아니면(parentOffset > 0) false를 반환한다', () => {
      renderHook(() => usePostEditor());
      const { view } = createBackspaceView({ parentType: 'heading', parentOffset: 1 });
      const event = { key: 'Backspace', preventDefault: jest.fn() };

      const result = capturedConfig.editorProps.handleKeyDown(view, event);

      expect(result).toBe(false);
    });
  });

  describe('handleKeyDown — 슬래시 메뉴 차단', () => {
    it.each(['Enter', 'ArrowUp', 'ArrowDown'])(
      '슬래시 메뉴가 열린 상태에서 %s 키를 차단한다 (preventDefault + return true)',
      (key) => {
        renderHook(() => usePostEditor());
        openSlashMenu();

        const event = { key, preventDefault: jest.fn() };
        const result = capturedConfig.editorProps.handleKeyDown({}, event);

        expect(event.preventDefault).toHaveBeenCalled();
        expect(result).toBe(true);
      },
    );

    it('슬래시 메뉴가 닫힌 상태에서 Enter는 차단하지 않는다', () => {
      renderHook(() => usePostEditor());

      const event = { key: 'Enter', preventDefault: jest.fn() };
      const result = capturedConfig.editorProps.handleKeyDown(minimalView, event);

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('onUpdate', () => {
    it('/ 입력 시 showSlashMenu가 true가 된다', () => {
      const { result } = renderHook(() => usePostEditor());

      act(() => {
        capturedConfig.onUpdate({
          editor: {
            getHTML: () => '<p>/</p>',
            state: { selection: { $from: { nodeBefore: { textContent: '/' } } } },
          },
        });
      });

      expect(result.current.showSlashMenu).toBe(true);
    });

    it('일반 텍스트 입력 시 showSlashMenu가 false이다', () => {
      const { result } = renderHook(() => usePostEditor());

      act(() => {
        capturedConfig.onUpdate({
          editor: {
            getHTML: () => '<p>hello</p>',
            state: { selection: { $from: { nodeBefore: { textContent: 'hello' } } } },
          },
        });
      });

      expect(result.current.showSlashMenu).toBe(false);
    });

    it('에디터 HTML을 setContent로 동기화한다', () => {
      renderHook(() => usePostEditor());

      const html = '<p>게시글 내용</p>';
      act(() => {
        capturedConfig.onUpdate({
          editor: {
            getHTML: () => html,
            state: { selection: { $from: { nodeBefore: null } } },
          },
        });
      });

      expect(mockSetContent).toHaveBeenCalledWith(html);
    });
  });

  describe('onSelectionUpdate', () => {
    it('슬래시 메뉴가 열린 상태에서 커서가 / 밖으로 이동하면 메뉴가 닫힌다', () => {
      const { result } = renderHook(() => usePostEditor());

      openSlashMenu();
      expect(result.current.showSlashMenu).toBe(true);

      act(() => {
        capturedConfig.onSelectionUpdate({
          editor: {
            state: { selection: { $from: { nodeBefore: { textContent: 'hello' } } } },
          },
        });
      });

      expect(result.current.showSlashMenu).toBe(false);
    });

    it('슬래시 메뉴가 이미 닫혀 있으면 onSelectionUpdate가 아무것도 하지 않는다', () => {
      const { result } = renderHook(() => usePostEditor());

      act(() => {
        capturedConfig.onSelectionUpdate({
          editor: {
            state: { selection: { $from: { nodeBefore: { textContent: 'hello' } } } },
          },
        });
      });

      expect(result.current.showSlashMenu).toBe(false);
    });
  });

  describe('closeSlashMenu', () => {
    it('closeSlashMenu 호출 시 showSlashMenu가 false가 된다', () => {
      const { result } = renderHook(() => usePostEditor());

      openSlashMenu();
      expect(result.current.showSlashMenu).toBe(true);

      act(() => {
        result.current.closeSlashMenu();
      });

      expect(result.current.showSlashMenu).toBe(false);
    });
  });
});
